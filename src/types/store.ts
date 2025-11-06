/**
 * Type definitions for Zustand store
 */

import type { Attack, Taxonomy, Stats } from './attack';

export interface Filters {
  categories: string[];
  intents: string[];
  modalities: string[];
  attackTypes: string[];
  severities: string[];
  searchQuery: string;
  yearRange: [number, number];
  tags: string[];
}

export interface FilteredStats {
  totalAttacks: number;
  avgSuccessRate: string;
  mostCommonModality: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
}

export interface FilterStore {
  // State
  allAttacks: Attack[];
  filteredAttacks: Attack[];
  taxonomy: Taxonomy;
  stats: Stats;
  filters: Filters;
  loading: boolean;
  error: string | null;

  // Actions
  setAllAttacks: (attacks: Attack[], taxonomy: Taxonomy, stats: Stats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setFilter: (filterType: keyof Filters, values: any) => void;
  toggleFilter: (filterType: keyof Filters, value: any) => void;
  setSearchQuery: (query: string) => void;
  setYearRange: (range: [number, number]) => void;
  clearFilters: () => void;
  getActiveFilterCount: () => number;
  getFilteredStats: () => FilteredStats;
}
