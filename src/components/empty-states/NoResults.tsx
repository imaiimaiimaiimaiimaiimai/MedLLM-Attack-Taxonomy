import { Search, Filter } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface NoResultsProps {
  query?: string;
  onClearFilters?: () => void;
}

export function NoResults({ query, onClearFilters }: NoResultsProps) {
  if (query) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description={`No attacks match your search for "${query}". Try adjusting your search terms.`}
        actionLabel={onClearFilters ? "Clear search" : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <EmptyState
      icon={Filter}
      title="No attacks match your filters"
      description="Try adjusting or clearing your filters to see more results."
      actionLabel={onClearFilters ? "Clear all filters" : undefined}
      onAction={onClearFilters}
    />
  );
}
