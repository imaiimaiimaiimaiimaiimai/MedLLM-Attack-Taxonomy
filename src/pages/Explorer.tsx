import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3x3, List, X, CheckCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import SearchBar from '../components/filters/SearchBar';
import FilterPanel from '../components/filters/FilterPanel';
import AttackCard from '../components/dashboard/AttackCard';
import AttackDetailModal from '../components/dashboard/AttackDetailModal';
import VirtualizedAttackGrid from '../components/dashboard/VirtualizedAttackGrid';
import { HelpDialog } from '../components/ui/help-dialog';
import { useFilterStore } from '../store/filterStore';
import { loadAttacksData } from '../data/dataProcessor';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useURLFilters } from '../hooks/useURLFilters';
import { Loader2 } from 'lucide-react';
import type { Attack } from '../types/attack';
import type { ViewMode } from '../types/common';
import { AttackGridSkeleton } from '../components/loaders/AttackCardSkeleton';

export default function Explorer() {
  const navigate = useNavigate();
  const { setAllAttacks, setLoading, setError, loading, error, filteredAttacks, clearFilters } = useFilterStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAttacks, setSelectedAttacks] = useState<Attack[]>([]);
  const [detailAttack, setDetailAttack] = useState<Attack | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync filters with URL
  useURLFilters();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadAttacksData();
        setAllAttacks(data.attacks, data.taxonomy, data.stats);
      } catch (err) {
        console.error('Error loading data:', err);
        setError((err as Error).message);
      }
    };

    loadData();
  }, [setAllAttacks, setLoading, setError]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: () => {
      searchInputRef.current?.focus();
    },
    onClearFilters: () => {
      clearFilters();
    },
    onShowHelp: () => {
      setShowHelp(true);
    },
  });

  const handleViewDetails = (attack: Attack) => {
    setDetailAttack(attack);
    setShowDetailModal(true);
  };

  const handleCompare = (attack: Attack) => {
    setSelectedAttacks(prev => {
      const isSelected = prev.some(a => a.id === attack.id);
      if (isSelected) {
        return prev.filter(a => a.id !== attack.id);
      } else {
        // Limit to 3 attacks for comparison
        if (prev.length >= 3) {
          return [...prev.slice(1), attack];
        }
        return [...prev, attack];
      }
    });
  };

  const clearComparison = () => {
    setSelectedAttacks([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-9 w-48 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-6">
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>

        {/* View Mode Toggle Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel Skeleton */}
          <div className="lg:col-span-1">
            <div className="h-96 bg-muted animate-pulse rounded" />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AttackGridSkeleton count={9} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading data:</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Attack Explorer</h1>
        <p className="text-muted-foreground">
          Explore attacks in detail, compare multiple attacks, and discover patterns
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar ref={searchInputRef} />
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {selectedAttacks.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {selectedAttacks.length} selected for comparison
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={clearComparison}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel - Left Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Comparison Panel */}
          {selectedAttacks.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCheck className="h-5 w-5" />
                    Comparing {selectedAttacks.length} Attacks
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearComparison}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {selectedAttacks.map(attack => (
                    <div key={attack.id} className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                        {attack.item}
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Severity</p>
                          <Badge variant={attack.severity === 'critical' ? 'critical' : attack.severity === 'high' ? 'warning' : 'secondary'} className="capitalize text-xs">
                            {attack.severity}
                          </Badge>
                        </div>
                        {attack.successRate !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                            <p className="text-sm font-semibold">{attack.successRate.toFixed(1)}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Attack Types</p>
                          <p className="text-xs">{attack.attackTypes?.slice(0, 2).join(', ') || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    const ids = selectedAttacks.map(a => a.id).join(',');
                    navigate(`/comparison?ids=${ids}`);
                  }}
                >
                  View Detailed Comparison
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAttacks.length} attack{filteredAttacks.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Attack Grid/List - Virtualized */}
          <VirtualizedAttackGrid
            attacks={filteredAttacks}
            viewMode={viewMode}
            onViewDetails={handleViewDetails}
            onCompare={handleCompare}
            selectedAttacks={selectedAttacks}
          />
        </div>
      </div>

      {/* Attack Detail Modal */}
      <AttackDetailModal
        attack={detailAttack}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />

      {/* Help Dialog */}
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}
