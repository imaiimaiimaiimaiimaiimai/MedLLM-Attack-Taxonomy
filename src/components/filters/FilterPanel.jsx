import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { useFilterStore } from '../../store/filterStore';
import { X, Filter } from 'lucide-react';

function FilterChip({ label, count, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
        transition-colors border
        ${isSelected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background hover:bg-accent border-border'
        }
      `}
    >
      {label}
      {count !== undefined && (
        <span className={`text-xs ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}

function FilterSection({ title, filters, selectedFilters, onToggle, getCounts }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            count={getCounts ? getCounts(filter) : undefined}
            isSelected={selectedFilters.includes(filter)}
            onClick={() => onToggle(filter)}
          />
        ))}
      </div>
    </div>
  );
}

export default function FilterPanel() {
  const {
    taxonomy,
    filters,
    toggleFilter,
    clearFilters,
    getActiveFilterCount,
    setYearRange,
    allAttacks,
  } = useFilterStore();

  const activeCount = getActiveFilterCount();

  // Helper to count attacks for each filter option
  const getModalityCount = (modality) => {
    return allAttacks.filter(a => a.modalities?.includes(modality)).length;
  };

  const getAttackTypeCount = (type) => {
    return allAttacks.filter(a => a.attackTypes?.includes(type)).length;
  };

  const getSeverityCount = (severity) => {
    return allAttacks.filter(a => a.severity === severity).length;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
            {activeCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeCount}
              </Badge>
            )}
          </div>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attack Modality Filter */}
        {taxonomy.modalities && taxonomy.modalities.length > 0 && (
          <FilterSection
            title="Attack Modality"
            filters={taxonomy.modalities}
            selectedFilters={filters.modalities}
            onToggle={(mod) => toggleFilter('modalities', mod)}
            getCounts={getModalityCount}
          />
        )}

        {/* Attack Type Filter */}
        {taxonomy.attackTypes && taxonomy.attackTypes.length > 0 && (
          <FilterSection
            title="Attack Type"
            filters={taxonomy.attackTypes}
            selectedFilters={filters.attackTypes}
            onToggle={(type) => toggleFilter('attackTypes', type)}
            getCounts={getAttackTypeCount}
          />
        )}

        {/* Severity Level Filter */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-foreground">Severity Level</h3>
          <div className="flex flex-wrap gap-2">
            {taxonomy.severities.map((severity) => {
              const isSelected = filters.severities.includes(severity);
              const variantMap = {
                critical: 'critical',
                high: 'warning',
                medium: 'secondary',
              };

              return (
                <button
                  key={severity}
                  onClick={() => toggleFilter('severities', severity)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                    transition-colors border capitalize
                    ${isSelected
                      ? severity === 'critical'
                        ? 'bg-red-500 text-white border-red-500'
                        : severity === 'high'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-background hover:bg-accent border-border'
                    }
                  `}
                >
                  {severity}
                  <span className={`text-xs ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>
                    ({getSeverityCount(severity)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Publication Year Range */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-foreground">
            Publication Year: {filters.yearRange[0]} - {filters.yearRange[1]}
          </h3>
          <Slider
            min={2019}
            max={2025}
            step={1}
            value={filters.yearRange}
            onValueChange={(value) => setYearRange(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2019</span>
            <span>2025</span>
          </div>
        </div>

        {/* Tags Filter */}
        {taxonomy.tags && taxonomy.tags.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {taxonomy.tags.map((tag) => {
                const isSelected = filters.tags?.includes(tag);
                const tagCount = allAttacks.filter(a => a.tags?.includes(tag)).length;

                return (
                  <button
                    key={tag}
                    onClick={() => toggleFilter('tags', tag)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                      transition-colors border capitalize
                      ${isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent border-border'
                      }
                    `}
                  >
                    {tag}
                    <span className={`text-xs ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>
                      ({tagCount})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
