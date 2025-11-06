import { useState, useEffect, forwardRef, useRef } from 'react';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useFilterStore } from '../../store/filterStore';
import { useRecentSearches } from '../../hooks/useRecentSearches';

// SearchBar component with forwardRef for keyboard shortcut support
const SearchBar = forwardRef((props, ref) => {
  const { filters, setSearchQuery } = useFilterStore();
  const { recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch } = useRecentSearches();
  const [localQuery, setLocalQuery] = useState(filters.searchQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounce search query and save to recent searches
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(localQuery);
      // Only add to recent searches if query is not empty
      if (localQuery && localQuery.trim().length > 0) {
        addRecentSearch(localQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localQuery, setSearchQuery, addRecentSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  const handleRecentClick = (query) => {
    setLocalQuery(query);
    setSearchQuery(query);
    setShowDropdown(false);
  };

  const handleRemoveRecent = (e, query) => {
    e.stopPropagation();
    removeRecentSearch(query);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    clearRecentSearches();
  };

  const showRecentSearches = showDropdown && recentSearches.length > 0 && !localQuery;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          placeholder="Search attacks, methods, descriptions, references..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="pl-10 pr-10"
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Recent Searches Dropdown */}
      {showRecentSearches && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Recent Searches</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleClearAll}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
          <div className="py-1">
            {recentSearches.map((query, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer group"
                onClick={() => handleRecentClick(query)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{query}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleRemoveRecent(e, query)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
