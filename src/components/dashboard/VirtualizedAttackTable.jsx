import { useState, useMemo, useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import { ChevronDown, ChevronUp, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useFilterStore } from '../../store/filterStore';
import { NoResults } from '../empty-states/NoResults';

function ExpandableRow({ attack, isExpanded, onToggle, style }) {
  const severityColor = {
    critical: 'critical',
    high: 'warning',
    medium: 'secondary',
  };

  return (
    <div style={style} className="border-b">
      {/* Main Row */}
      <div
        className="grid grid-cols-5 gap-4 py-3 px-4 hover:bg-accent/50 cursor-pointer transition-colors items-center"
        onClick={onToggle}
      >
        {/* Attack Name */}
        <div className="flex items-center gap-2 min-w-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <span className="font-medium text-sm truncate">{attack.item}</span>
        </div>

        {/* Category */}
        <div className="min-w-0">
          <span className="text-sm text-muted-foreground truncate block">{attack.category}</span>
        </div>

        {/* Modalities */}
        <div className="flex flex-wrap gap-1 min-w-0">
          {attack.modalities && attack.modalities.length > 0 ? (
            attack.modalities.slice(0, 2).map((mod) => (
              <Badge key={mod} variant="outline" className="text-xs">
                {mod}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
          {attack.modalities && attack.modalities.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{attack.modalities.length - 2}
            </Badge>
          )}
        </div>

        {/* Severity */}
        <div>
          <Badge variant={severityColor[attack.severity]} className="capitalize">
            {attack.severity}
          </Badge>
        </div>

        {/* Success Rate */}
        <div>
          {attack.successRate !== null ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${attack.successRate}%` }}
                />
              </div>
              <span className="text-sm font-medium min-w-[45px]">
                {attack.successRate.toFixed(1)}%
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-accent/20 py-4 px-4">
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {attack.description || 'No description available.'}
              </p>
            </div>

            {/* Attack Types */}
            {attack.attackTypes && attack.attackTypes.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Attack Types</h4>
                <div className="flex flex-wrap gap-2">
                  {attack.attackTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {attack.tags && attack.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {attack.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reference */}
            {attack.reference && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Reference</h4>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground">
                    {attack.reference.authors} ({attack.reference.year})
                  </span>
                  {attack.reference.url && (
                    <a
                      href={attack.reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Paper
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VirtualizedAttackTable() {
  const { filteredAttacks, clearFilters, filters } = useFilterStore();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const listRef = useRef(null);
  const rowHeights = useRef({});

  const toggleRow = (attackId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(attackId)) {
      newExpanded.delete(attackId);
    } else {
      newExpanded.add(attackId);
    }
    setExpandedRows(newExpanded);

    // Reset cached heights for this item
    if (listRef.current) {
      const index = sortedAttacks.findIndex(a => a.id === attackId);
      if (index !== -1) {
        listRef.current.resetAfterIndex(index);
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAttacks = useMemo(() => {
    if (!sortConfig.key) return filteredAttacks;

    return [...filteredAttacks].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case 'name':
          aVal = a.item || '';
          bVal = b.item || '';
          break;
        case 'category':
          aVal = a.category || '';
          bVal = b.category || '';
          break;
        case 'severity':
          const severityOrder = { critical: 3, high: 2, medium: 1 };
          aVal = severityOrder[a.severity] || 0;
          bVal = severityOrder[b.severity] || 0;
          break;
        case 'successRate':
          aVal = a.successRate || 0;
          bVal = b.successRate || 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAttacks, sortConfig]);

  // Calculate item height based on whether it's expanded
  const getItemSize = (index) => {
    const attack = sortedAttacks[index];
    if (!attack) return 60; // Default collapsed height

    const isExpanded = expandedRows.has(attack.id);

    if (!isExpanded) {
      return 60; // Collapsed row height
    }

    // Expanded height calculation (approximate)
    let expandedHeight = 60; // Base row height

    // Description height (approximate)
    const descriptionLength = attack.description?.length || 0;
    const descriptionLines = Math.ceil(descriptionLength / 80); // ~80 chars per line
    expandedHeight += Math.max(descriptionLines * 20, 40) + 40; // padding

    // Attack types
    if (attack.attackTypes && attack.attackTypes.length > 0) {
      expandedHeight += 60;
    }

    // Tags
    if (attack.tags && attack.tags.length > 0) {
      expandedHeight += 60;
    }

    // Reference
    if (attack.reference) {
      expandedHeight += 60;
    }

    return expandedHeight;
  };

  // Reset scroll position when filters change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
      setExpandedRows(new Set()); // Collapse all rows on filter change
    }
  }, [filteredAttacks]);

  if (filteredAttacks.length === 0) {
    return <NoResults query={filters.searchQuery} onClearFilters={clearFilters} />;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      {/* Header */}
      <div className="bg-muted border-b">
        <div className="grid grid-cols-5 gap-4 py-3 px-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('name')}
              className="h-8 -ml-3 font-semibold"
            >
              Attack Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('category')}
              className="h-8 -ml-3 font-semibold"
            >
              Category
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="font-semibold text-sm py-2">Modality</div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('severity')}
              className="h-8 -ml-3 font-semibold"
            >
              Severity
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('successRate')}
              className="h-8 -ml-3 font-semibold"
            >
              Success Rate
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Virtualized List */}
      <List
        ref={listRef}
        height={600}
        itemCount={sortedAttacks.length}
        itemSize={getItemSize}
        width="100%"
        overscanCount={5}
      >
        {({ index, style }) => (
          <ExpandableRow
            attack={sortedAttacks[index]}
            isExpanded={expandedRows.has(sortedAttacks[index].id)}
            onToggle={() => toggleRow(sortedAttacks[index].id)}
            style={style}
          />
        )}
      </List>

      {/* Footer with count */}
      <div className="bg-muted border-t py-2 px-4">
        <p className="text-xs text-muted-foreground">
          Showing {sortedAttacks.length} attack{sortedAttacks.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
