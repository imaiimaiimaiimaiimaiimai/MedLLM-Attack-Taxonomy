/**
 * Type definitions for attack data
 */

export type Severity = 'critical' | 'high' | 'medium';

export interface Reference {
  authors: string;
  year: number | null;
  url: string | null;
}

export interface Attack {
  id: string;
  category: string;
  item: string;
  description: string;
  reference: Reference | null;
  modalities: string[];
  attackTypes: string[];
  severity: Severity;
  successRate: number | null;
  tags: string[];
}

export interface Taxonomy {
  categories: string[];
  intents: string[];
  modalities: string[];
  attackTypes: string[];
  contexts: string[];
  severities: Severity[];
  tags: string[];
}

export interface Stats {
  totalAttacks: number;
  categoriesCount: number;
  avgSuccessRate: number;
}

export interface ProcessedData {
  attacks: Attack[];
  taxonomy: Taxonomy;
  stats: Stats;
}
