import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import SearchBar from '../components/filters/SearchBar';
import FilterPanel from '../components/filters/FilterPanel';
import StatsCards from '../components/dashboard/StatsCards';
import AttackTable from '../components/dashboard/AttackTable';
import VirtualizedAttackTable from '../components/dashboard/VirtualizedAttackTable';
import SuccessRateChart from '../components/visualizations/SuccessRateChart';
import SeverityDistribution from '../components/visualizations/SeverityDistribution';
import TaxonomyTree from '../components/visualizations/TaxonomyTree';
import AttackHeatmap from '../components/visualizations/AttackHeatmap';
import NetworkGraph from '../components/visualizations/NetworkGraph';
import { HelpDialog } from '../components/ui/help-dialog';
import { useFilterStore } from '../store/filterStore';
import { loadAttacksData } from '../data/dataProcessor';
import { exportToCSV } from '../utils/exportUtils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useURLFilters } from '../hooks/useURLFilters';
import { Loader2, Download } from 'lucide-react';
import { StatsCardsSkeleton } from '../components/loaders/StatsCardsSkeleton';
import { TableSkeleton } from '../components/loaders/TableSkeleton';

export default function Dashboard() {
  const { setAllAttacks, setLoading, setError, loading, error, filteredAttacks, clearFilters } = useFilterStore();
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-muted animate-pulse rounded" />
            <div className="h-5 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-6">
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel Skeleton */}
          <div className="lg:col-span-1">
            <div className="h-96 bg-muted animate-pulse rounded" />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards Skeleton */}
            <StatsCardsSkeleton />

            {/* Table Skeleton */}
            <div className="rounded-lg border bg-card p-6">
              <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
              <TableSkeleton rows={8} />
            </div>
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

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(filteredAttacks, `medical-llm-attacks-${timestamp}.csv`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Medical LLM Attack Explorer</h1>
          <p className="text-muted-foreground">
            Explore and analyze adversarial attacks on medical AI systems
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar ref={searchInputRef} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel - Left Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Cards */}
          <StatsCards />

          {/* Tabs for Different Views */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">Attack Overview</h2>
                <VirtualizedAttackTable />
              </div>
            </TabsContent>
            <TabsContent value="taxonomy" className="space-y-4">
              <TaxonomyTree />
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <div className="grid gap-4">
                <AttackHeatmap />
                <div className="grid lg:grid-cols-2 gap-4">
                  <SuccessRateChart />
                  <SeverityDistribution />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <NetworkGraph />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Help Dialog */}
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}
