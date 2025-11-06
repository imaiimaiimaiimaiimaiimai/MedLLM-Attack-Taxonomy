import { useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import AttackCard from './AttackCard';
import { NoResults } from '../empty-states/NoResults';
import { useFilterStore } from '../../store/filterStore';

export default function VirtualizedAttackGrid({
  attacks,
  viewMode,
  onViewDetails,
  onCompare,
  selectedAttacks,
}) {
  const { clearFilters, filters } = useFilterStore();
  const listRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate columns based on viewport width and view mode
  const getColumnsPerRow = () => {
    if (viewMode === 'list') return 1;

    if (!containerRef.current) return 3;

    const width = containerRef.current.offsetWidth;
    if (width < 768) return 1; // mobile
    if (width < 1280) return 2; // tablet
    return 3; // desktop
  };

  const columnsPerRow = getColumnsPerRow();
  const rowCount = Math.ceil(attacks.length / columnsPerRow);

  // Card dimensions
  const cardHeight = viewMode === 'list' ? 200 : 320;
  const gap = 16;

  // Reset scroll position only when the number of attacks changes significantly
  // (not on every re-render or selection change)
  const prevAttackCountRef = useRef(attacks.length);
  useEffect(() => {
    const currentCount = attacks.length;
    const prevCount = prevAttackCountRef.current;

    // Only reset scroll if attacks count changed (likely due to filter change)
    // Don't reset on minor changes or same count (selection changes)
    if (listRef.current && currentCount !== prevCount) {
      listRef.current.scrollTo(0);
      prevAttackCountRef.current = currentCount;
    }
  }, [attacks.length]); // Only depend on length, not the whole array

  // Row renderer
  const Row = ({ index, style }) => {
    const startIndex = index * columnsPerRow;
    const items = attacks.slice(startIndex, startIndex + columnsPerRow);

    return (
      <div style={style}>
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-1'
              : 'space-y-4 px-1'
          }
        >
          {items.map((attack) => (
            <AttackCard
              key={attack.id}
              attack={attack}
              onViewDetails={onViewDetails}
              onCompare={onCompare}
              isSelected={selectedAttacks.some((a) => a.id === attack.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  if (attacks.length === 0) {
    return <NoResults query={filters.searchQuery} onClearFilters={clearFilters} />;
  }

  return (
    <div ref={containerRef} className="w-full">
      <List
        ref={listRef}
        height={600}
        itemCount={rowCount}
        itemSize={cardHeight + gap}
        width="100%"
        overscanCount={2}
      >
        {Row}
      </List>
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {attacks.length} attack{attacks.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
