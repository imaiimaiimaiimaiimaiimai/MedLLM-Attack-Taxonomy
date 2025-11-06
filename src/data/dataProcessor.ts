import Papa from 'papaparse';
import { uniq, compact } from 'lodash';
import type { Attack, Reference, Severity, ProcessedData } from '../types/attack';

// CSV row structure
interface CSVRow {
  Category?: string;
  'Item/intent'?: string;
  Description?: string;
  Reference?: string;
  [key: string]: string | undefined;
}

// Keywords for extraction
const MODALITY_KEYWORDS = {
  text: ['text', 'prompt', 'instruction', 'query', 'language'],
  image: ['image', 'x-ray', 'ct', 'mri', 'scan', 'visual', 'photo', 'picture', 'dermoscopy', 'histology', 'radiology'],
  multimodal: ['multimodal', 'cross-modal', 'image+text', 'visual+text'],
  training: ['training', 'fine-tuning', 'pre-training', 'dataset', 'data poisoning'],
};

const ATTACK_TYPE_KEYWORDS: Record<string, string[]> = {
  'Prompt Injection': ['prompt injection', 'direct pi', 'indirect pi', 'rag injection', 'appending'],
  'Jailbreaking': ['jailbreak', 'bypass', 'safety', 'alignment'],
  'Data Poisoning': ['poison', 'poisoning', 'contamination', 'backdoor'],
  'Adversarial Perturbation': ['adversarial', 'perturbation', 'noise', 'pgd', 'apgd', 'cw attack'],
  'Model Stealing': ['stealing', 'replication', 'ip theft', 'ada-steal'],
  'Weight Manipulation': ['weight', 'manipulation', 'modification'],
  'Cross-Modal Attack': ['cross-modal', 'modality mismatch', '2m attack', 'o2m attack', 'mcm'],
  'Visual Grounding': ['visual grounding', 'bounding box', 'localization'],
};

const SEVERITY_KEYWORDS: Record<Severity, string[]> = {
  critical: ['patient harm', 'death', 'critical', 'severe', 'fatal', 'life-threatening', 'murder', 'kill'],
  high: ['fraud', 'steal', 'manipulate', 'misdiagnos', 'harmful', 'dangerous', 'illegal', 'unauthorized', 'exfiltration'],
  medium: ['disrupt', 'degrade', 'inaccurate', 'mislead', 'confusion', 'error'],
};

/**
 * Extracts modalities from description text
 */
function extractModalities(description: string | undefined): string[] {
  if (!description) return [];

  const lower = description.toLowerCase();
  const modalities = new Set<string>();

  // Check for specific keywords
  if (lower.match(/\b(text|prompt|language)\b/)) modalities.add('Text');
  if (lower.match(/\b(image|x-ray|ct|mri|scan|visual|photo|dermoscopy|histology|radiology)\b/)) modalities.add('Image');
  if (lower.match(/\b(multimodal|cross-modal|vision|language)\b/) || (lower.includes('image') && lower.includes('text'))) {
    modalities.add('Image+Text');
  }
  if (lower.match(/\b(training|fine-tuning|dataset|data)\b/)) modalities.add('Training Data');

  return Array.from(modalities);
}

/**
 * Extracts attack types from description and category
 */
function extractAttackTypes(description?: string, category?: string, item?: string): string[] {
  if (!description && !category && !item) return [];

  const searchText = `${description || ''} ${category || ''} ${item || ''}`.toLowerCase();
  const attackTypes = new Set<string>();

  Object.entries(ATTACK_TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      attackTypes.add(type);
    }
  });

  return Array.from(attackTypes);
}

/**
 * Extracts success rate from description (converts percentages and decimals)
 */
function extractSuccessRate(description: string | undefined): number | null {
  if (!description) return null;

  // Match patterns like: "0.985", "98.5%", "success rate of 81%"
  const patterns = [
    /success rate[:\s]+of[:\s]+([\d.]+)%?/i,
    /asr[:\s]+([\d.]+)%?/i,
    /attack success[:\s]+([\d.]+)%?/i,
    /achieving[:\s]+([\d.]+)/i,
    /\b(0\.\d+)\b/,  // Match decimals like 0.985
    /\b(\d{1,3})%/,  // Match percentages
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      let rate = parseFloat(match[1]);
      // Convert decimal to percentage if < 1
      if (rate < 1 && rate > 0) {
        rate = rate * 100;
      }
      // Ensure rate is between 0 and 100
      if (rate >= 0 && rate <= 100) {
        return rate;
      }
    }
  }

  return null;
}

/**
 * Computes severity based on keywords in description
 */
function computeSeverity(description?: string, category?: string): Severity {
  if (!description && !category) return 'medium';

  const searchText = `${description || ''} ${category || ''}`.toLowerCase();

  // Check for critical keywords
  if (SEVERITY_KEYWORDS.critical.some(keyword => searchText.includes(keyword))) {
    return 'critical';
  }

  // Check for high severity keywords
  if (SEVERITY_KEYWORDS.high.some(keyword => searchText.includes(keyword))) {
    return 'high';
  }

  // Default to medium
  return 'medium';
}

/**
 * Parses reference string to extract author, year, and URL
 */
function parseReference(referenceString: string | undefined): Reference | null {
  if (!referenceString || referenceString.trim() === '') return null;

  // Pattern: "Author et al., YEAR URL"
  const match = referenceString.match(/(.*?),?\s*(\d{4})\s+(https?:\/\/[^\s]+)/);

  if (match) {
    return {
      authors: match[1].trim(),
      year: parseInt(match[2]),
      url: match[3].trim()
    };
  }

  // Fallback: try to extract at least the year and URL
  const yearMatch = referenceString.match(/(\d{4})/);
  const urlMatch = referenceString.match(/(https?:\/\/[^\s]+)/);

  return {
    authors: referenceString.split(/\d{4}/)[0]?.trim() || 'Unknown',
    year: yearMatch ? parseInt(yearMatch[1]) : null,
    url: urlMatch ? urlMatch[1] : null
  };
}

/**
 * Generates tags from description and category
 */
function generateTags(description?: string, category?: string, item?: string): string[] {
  const tags = new Set<string>();
  const text = `${description || ''} ${category || ''} ${item || ''}`.toLowerCase();

  // Common medical/security tags
  const tagKeywords: Record<string, string[]> = {
    'clinical': ['clinical', 'diagnosis', 'treatment', 'patient'],
    'radiology': ['radiology', 'x-ray', 'ct', 'mri', 'scan'],
    'insurance': ['insurance', 'billing', 'claim', 'reimbursement'],
    'fraud': ['fraud', 'steal', 'theft', 'scam'],
    'security': ['security', 'vulnerability', 'exploit', 'attack'],
    'privacy': ['privacy', 'hipaa', 'data', 'patient'],
    'misinformation': ['misinformation', 'mislead', 'false', 'incorrect'],
    'manipulation': ['manipulate', 'modify', 'alter', 'change'],
  };

  Object.entries(tagKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.add(tag);
    }
  });

  return Array.from(tags);
}

/**
 * Main function to process CSV data
 */
export async function processAttacksData(csvContent: string): Promise<ProcessedData> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Filter out rows without valid data
          const rawData = results.data.filter(row =>
            row.Category && row.Category.trim() !== '' &&
            row['Item/intent'] && row['Item/intent'].trim() !== ''
          );

          // Process each row
          const attacks: Attack[] = rawData.map((row, index) => {
            const description = row.Description || '';
            const category = row.Category || '';
            const item = row['Item/intent'] || '';
            const reference = row.Reference || '';

            return {
              id: `attack-${index + 1}`,
              category,
              item,
              description,
              reference: parseReference(reference),
              modalities: extractModalities(description),
              attackTypes: extractAttackTypes(description, category, item),
              severity: computeSeverity(description, category),
              successRate: extractSuccessRate(description),
              tags: generateTags(description, category, item),
            };
          });

          // Build taxonomy
          const taxonomy = {
            categories: uniq(compact(attacks.map(a => a.category))).sort(),
            intents: uniq(compact(attacks.filter(a => a.category.includes('Intent')).map(a => a.item))).sort(),
            modalities: uniq(compact(attacks.flatMap(a => a.modalities))).sort(),
            attackTypes: uniq(compact(attacks.flatMap(a => a.attackTypes))).sort(),
            contexts: uniq(compact(attacks.filter(a => a.category.includes('Context')).map(a => a.item))).sort(),
            severities: ['critical', 'high', 'medium'] as Severity[],
            tags: uniq(compact(attacks.flatMap(a => a.tags))).sort(),
          };

          const attacksWithRate = attacks.filter(a => a.successRate !== null);
          const avgSuccessRate = attacksWithRate.length > 0
            ? attacksWithRate.reduce((sum, a) => sum + (a.successRate || 0), 0) / attacksWithRate.length
            : 0;

          resolve({
            attacks,
            taxonomy,
            stats: {
              totalAttacks: attacks.length,
              categoriesCount: taxonomy.categories.length,
              avgSuccessRate,
            }
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Load CSV file from public folder or imported data
 */
export async function loadAttacksData(): Promise<ProcessedData> {
  try {
    // Use base URL from Vite config to work in both dev and production
    const baseUrl = import.meta.env.BASE_URL || '/';
    const csvPath = `${baseUrl}attacks.csv`;

    console.log('Loading CSV from:', csvPath);
    const response = await fetch(csvPath);

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    const csvText = await response.text();
    return await processAttacksData(csvText);
  } catch (error) {
    console.error('Error loading attacks data:', error);
    throw error;
  }
}
