import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useFilterStore } from '../../store/filterStore';

function ExpandableRow({ attack, isExpanded, onToggle }) {
  const severityColor = {
    critical: 'critical',
    high: 'warning',
    medium: 'secondary',
  };

  return (
    <>
      <tr
        className="border-b hover:bg-accent/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{attack.item}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="text-sm text-muted-foreground">{attack.category}</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex flex-wrap gap-1">
            {attack.modalities && attack.modalities.length > 0 ? (
              attack.modalities.map((mod) => (
                <Badge key={mod} variant="outline" className="text-xs">
                  {mod}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">N/A</span>
            )}
          </div>
        </td>
        <td className="py-3 px-4">
          <Badge variant={severityColor[attack.severity]} className="capitalize">
            {attack.severity}
          </Badge>
        </td>
        <td className="py-3 px-4">
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
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b bg-accent/20">
          <td colSpan="5" className="py-4 px-4">
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
          </td>
        </tr>
      )}
    </>
  );
}

export default function AttackTable() {
  const { filteredAttacks } = useFilterStore();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const toggleRow = (attackId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(attackId)) {
      newExpanded.delete(attackId);
    } else {
      newExpanded.add(attackId);
    }
    setExpandedRows(newExpanded);
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

  if (filteredAttacks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No attacks found matching your filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('name')}
                  className="h-8 -ml-3 font-semibold"
                >
                  Attack Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="py-3 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('category')}
                  className="h-8 -ml-3 font-semibold"
                >
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="py-3 px-4 text-left font-semibold text-sm">
                Modality
              </th>
              <th className="py-3 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('severity')}
                  className="h-8 -ml-3 font-semibold"
                >
                  Severity
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="py-3 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('successRate')}
                  className="h-8 -ml-3 font-semibold"
                >
                  Success Rate
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAttacks.map((attack) => (
              <ExpandableRow
                key={attack.id}
                attack={attack}
                isExpanded={expandedRows.has(attack.id)}
                onToggle={() => toggleRow(attack.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
