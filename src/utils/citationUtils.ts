import type { Reference } from '../types/attack';

type CitationFormat = 'apa' | 'bibtex' | 'mla' | 'plain';

/**
 * Generates APA format citation
 */
export function formatAPA(reference: Reference | null): string {
  if (!reference) return '';

  const { authors, year, url } = reference;
  return `${authors} (${year}). Retrieved from ${url}`;
}

/**
 * Generates BibTeX format citation
 */
export function formatBibTeX(reference: Reference | null, key: string = 'reference'): string {
  if (!reference) return '';

  const { authors, year, url } = reference;

  // Extract first author's last name for the key
  const firstAuthor = authors.split(/et al\.|,/)[0].trim().toLowerCase().replace(/\s+/g, '');
  const bibtexKey = `${firstAuthor}${year}`;

  return `@article{${bibtexKey},
  author = {${authors}},
  year = {${year}},
  url = {${url}}
}`;
}

/**
 * Generates MLA format citation
 */
export function formatMLA(reference: Reference | null): string {
  if (!reference) return '';

  const { authors, year, url } = reference;
  return `${authors}. ${year}. Web. <${url}>`;
}

/**
 * Generates plain text citation
 */
export function formatPlainText(reference: Reference | null): string {
  if (!reference) return '';

  const { authors, year, url } = reference;
  return `${authors} (${year}) - ${url}`;
}

/**
 * Copy text to clipboard
 */
export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.reject(err);
    }
  }
}

/**
 * Export all references in a specific format
 */
export function exportAllReferences(references: Reference[], format: CitationFormat = 'bibtex'): string {
  const formattedRefs = references.map((ref, index) => {
    switch (format) {
      case 'apa':
        return formatAPA(ref);
      case 'bibtex':
        return formatBibTeX(ref, `ref${index + 1}`);
      case 'mla':
        return formatMLA(ref);
      default:
        return formatPlainText(ref);
    }
  });

  return formattedRefs.join('\n\n');
}
