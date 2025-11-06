import { useState, useEffect } from 'react';

const RECENT_SEARCHES_KEY = 'medical-llm-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Add a new search to recent searches
  const addRecentSearch = (query: string) => {
    if (!query || query.trim().length === 0) return;

    const trimmedQuery = query.trim();

    setRecentSearches((prev) => {
      // Remove if already exists (to move it to top)
      const filtered = prev.filter((q) => q !== trimmedQuery);
      // Add to front and limit to MAX_RECENT_SEARCHES
      const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      // Save to localStorage
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }

      return updated;
    });
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  // Remove a specific search
  const removeRecentSearch = (query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((q) => q !== query);

      // Save to localStorage
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error removing recent search:', error);
      }

      return updated;
    });
  };

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  };
}
