import { create } from 'zustand';
import type { Attack, Taxonomy, Stats } from '../types/attack';
import type { FilterStore, Filters, FilteredStats } from '../types/store';

/**
 * Filter application logic
 * Applies all active filters to the attacks array
 */
function applyFilters(attacks: Attack[], filters: Filters): Attack[] {
  return attacks.filter(attack => {
    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const searchText = `
        ${attack.item || ''}
        ${attack.description || ''}
        ${attack.category || ''}
        ${attack.reference?.authors || ''}
      `.toLowerCase();

      if (!searchText.includes(query)) return false;
    }

    // Category filter
    if (filters.categories.length > 0) {
      if (!filters.categories.some(cat => attack.category?.includes(cat))) return false;
    }

    // Intent filter
    if (filters.intents.length > 0) {
      if (!filters.intents.some(intent => attack.item?.includes(intent))) return false;
    }

    // Modality filter - attack must have at least one of the selected modalities
    if (filters.modalities.length > 0) {
      if (!filters.modalities.some(mod => attack.modalities?.includes(mod))) return false;
    }

    // Attack type filter - attack must have at least one of the selected types
    if (filters.attackTypes.length > 0) {
      if (!filters.attackTypes.some(type => attack.attackTypes?.includes(type))) return false;
    }

    // Severity filter
    if (filters.severities.length > 0) {
      if (!filters.severities.includes(attack.severity)) return false;
    }

    // Year range filter
    if (attack.reference?.year) {
      if (attack.reference.year < filters.yearRange[0] ||
          attack.reference.year > filters.yearRange[1]) return false;
    }

    // Tags filter (if any tags selected, attack must have at least one)
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some(tag => attack.tags?.includes(tag))) return false;
    }

    return true;
  });
}

/**
 * Zustand store for managing attack data and filters
 */
export const useFilterStore = create<FilterStore>((set, get) => ({
  // State
  allAttacks: [],
  filteredAttacks: [],
  taxonomy: {
    categories: [],
    intents: [],
    modalities: [],
    attackTypes: [],
    contexts: [],
    severities: ['critical', 'high', 'medium'],
    tags: [],
  },
  stats: {
    totalAttacks: 0,
    categoriesCount: 0,
    avgSuccessRate: 0,
  },
  filters: {
    categories: [],
    intents: [],
    modalities: [],
    attackTypes: [],
    severities: [],
    searchQuery: '',
    yearRange: [2019, 2025],
    tags: [],
  },
  loading: false,
  error: null,

  // Actions
  setAllAttacks: (attacks: Attack[], taxonomy: Taxonomy, stats: Stats) => set({
    allAttacks: attacks,
    filteredAttacks: attacks,
    taxonomy,
    stats,
    loading: false,
  }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string) => set({ error, loading: false }),

  setFilter: (filterType: keyof Filters, values: any) => set((state) => {
    const newFilters = { ...state.filters, [filterType]: values };
    return {
      filters: newFilters,
      filteredAttacks: applyFilters(state.allAttacks, newFilters)
    };
  }),

  toggleFilter: (filterType: keyof Filters, value: any) => set((state) => {
    const currentValues = state.filters[filterType] as any[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    const newFilters = { ...state.filters, [filterType]: newValues };
    return {
      filters: newFilters,
      filteredAttacks: applyFilters(state.allAttacks, newFilters)
    };
  }),

  setSearchQuery: (query: string) => set((state) => {
    const newFilters = { ...state.filters, searchQuery: query };
    return {
      filters: newFilters,
      filteredAttacks: applyFilters(state.allAttacks, newFilters)
    };
  }),

  setYearRange: (range: [number, number]) => set((state) => {
    const newFilters = { ...state.filters, yearRange: range };
    return {
      filters: newFilters,
      filteredAttacks: applyFilters(state.allAttacks, newFilters)
    };
  }),

  clearFilters: () => set((state) => ({
    filters: {
      categories: [],
      intents: [],
      modalities: [],
      attackTypes: [],
      severities: [],
      searchQuery: '',
      yearRange: [2019, 2025],
      tags: [],
    },
    filteredAttacks: state.allAttacks
  })),

  getActiveFilterCount: (): number => {
    const { filters } = get();
    return Object.entries(filters)
      .filter(([key]) => key !== 'yearRange' && key !== 'searchQuery')
      .reduce((count, [, value]) =>
        count + (Array.isArray(value) ? value.length : 0), 0);
  },

  // Get filtered stats
  getFilteredStats: (): FilteredStats => {
    const { filteredAttacks } = get();

    const attacksWithRate = filteredAttacks.filter(a => a.successRate !== null);
    const avgSuccessRate = attacksWithRate.length > 0
      ? attacksWithRate.reduce((sum, a) => sum + (a.successRate || 0), 0) / attacksWithRate.length
      : 0;

    const severityCounts = filteredAttacks.reduce<Record<string, number>>((acc, attack) => {
      acc[attack.severity] = (acc[attack.severity] || 0) + 1;
      return acc;
    }, {});

    const modalityCounts = filteredAttacks.reduce<Record<string, number>>((acc, attack) => {
      attack.modalities?.forEach(mod => {
        acc[mod] = (acc[mod] || 0) + 1;
      });
      return acc;
    }, {});

    const mostCommonModality = Object.entries(modalityCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalAttacks: filteredAttacks.length,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      mostCommonModality,
      criticalCount: severityCounts.critical || 0,
      highCount: severityCounts.high || 0,
      mediumCount: severityCounts.medium || 0,
    };
  },
}));
