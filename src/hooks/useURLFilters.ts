import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilterStore } from '../store/filterStore';

/**
 * Custom hook to sync filter state with URL search parameters
 * Enables sharing filtered views via URL
 */
export function useURLFilters(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilter, setSearchQuery, setYearRange } = useFilterStore();
  const isInitialMount = useRef(true);

  // Read from URL on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
      const intents = searchParams.get('intents')?.split(',').filter(Boolean) || [];
      const modalities = searchParams.get('modalities')?.split(',').filter(Boolean) || [];
      const attackTypes = searchParams.get('attackTypes')?.split(',').filter(Boolean) || [];
      const severities = searchParams.get('severities')?.split(',').filter(Boolean) || [];
      const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
      const query = searchParams.get('q') || '';
      const yearMin = parseInt(searchParams.get('yearMin') || '2019') || 2019;
      const yearMax = parseInt(searchParams.get('yearMax') || '2025') || 2025;

      // Apply filters from URL
      if (categories.length) setFilter('categories', categories);
      if (intents.length) setFilter('intents', intents);
      if (modalities.length) setFilter('modalities', modalities);
      if (attackTypes.length) setFilter('attackTypes', attackTypes);
      if (severities.length) setFilter('severities', severities);
      if (tags.length) setFilter('tags', tags);
      if (query) setSearchQuery(query);
      if (yearMin !== 2019 || yearMax !== 2025) {
        setYearRange([yearMin, yearMax]);
      }

      isInitialMount.current = false;
    }
  }, []); // Only run once on mount

  // Write to URL when filters change (after initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      const params = new URLSearchParams();

      // Add filters to URL if they have values
      if (filters.categories?.length) {
        params.set('categories', filters.categories.join(','));
      }
      if (filters.intents?.length) {
        params.set('intents', filters.intents.join(','));
      }
      if (filters.modalities?.length) {
        params.set('modalities', filters.modalities.join(','));
      }
      if (filters.attackTypes?.length) {
        params.set('attackTypes', filters.attackTypes.join(','));
      }
      if (filters.severities?.length) {
        params.set('severities', filters.severities.join(','));
      }
      if (filters.tags?.length) {
        params.set('tags', filters.tags.join(','));
      }
      if (filters.searchQuery) {
        params.set('q', filters.searchQuery);
      }
      if (filters.yearRange[0] !== 2019 || filters.yearRange[1] !== 2025) {
        params.set('yearMin', filters.yearRange[0].toString());
        params.set('yearMax', filters.yearRange[1].toString());
      }

      // Update URL without causing a navigation
      setSearchParams(params, { replace: true });
    }
  }, [
    filters.categories,
    filters.intents,
    filters.modalities,
    filters.attackTypes,
    filters.severities,
    filters.tags,
    filters.searchQuery,
    filters.yearRange,
    setSearchParams,
  ]);
}
