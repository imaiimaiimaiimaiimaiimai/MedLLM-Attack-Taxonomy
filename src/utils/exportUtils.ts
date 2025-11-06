import toast from 'react-hot-toast';
import type { Attack } from '../types/attack';

/**
 * Exports attack data to CSV format
 */
export function exportToCSV(attacks: Attack[], filename: string = 'medical-llm-attacks.csv'): void {
  if (!attacks || attacks.length === 0) {
    toast.error('No data to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Attack Name',
    'Category',
    'Description',
    'Modalities',
    'Attack Types',
    'Severity',
    'Success Rate (%)',
    'Tags',
    'Reference Authors',
    'Reference Year',
    'Reference URL',
  ];

  // Convert attacks to CSV rows
  const rows = attacks.map((attack) => {
    return [
      attack.id || '',
      attack.item || '',
      attack.category || '',
      attack.description ? `"${attack.description.replace(/"/g, '""')}"` : '', // Escape quotes
      attack.modalities?.join('; ') || '',
      attack.attackTypes?.join('; ') || '',
      attack.severity || '',
      attack.successRate !== null ? attack.successRate.toFixed(1) : '',
      attack.tags?.join('; ') || '',
      attack.reference?.authors || '',
      attack.reference?.year?.toString() || '',
      attack.reference?.url || '',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${attacks.length} attacks to ${filename}`);
  }
}

/**
 * Exports attack statistics to JSON format
 */
export function exportStatsToJSON(stats: Record<string, any>, filename: string = 'attack-stats.json'): void {
  const jsonContent = JSON.stringify(stats, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
