import { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { Search, Download, BookOpen, Calendar, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ReferenceCard from '../components/dashboard/ReferenceCard';
import { HelpDialog } from '../components/ui/help-dialog';
import { useFilterStore } from '../store/filterStore';
import { loadAttacksData } from '../data/dataProcessor';
import { exportAllReferences } from '../utils/citationUtils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Loader2 } from 'lucide-react';
import type { Attack, Reference } from '../types/attack';

type GroupBy = 'year' | 'author';
type SortOrder = 'asc' | 'desc';
type CitationFormat = 'bibtex' | 'apa';

interface ReferenceWithAttacks {
  reference: Reference;
  attacks: Attack[];
}

export default function References() {
  const { setAllAttacks, setLoading, setError, loading, error, allAttacks } = useFilterStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('year');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showHelp, setShowHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      setSearchQuery('');
    },
    onShowHelp: () => {
      setShowHelp(true);
    },
  });

  // Extract unique references with attack counts
  const referencesWithAttacks = useMemo(() => {
    const refMap = new Map<string, ReferenceWithAttacks>();

    allAttacks.forEach((attack) => {
      if (attack.reference && attack.reference.authors) {
        const key = `${attack.reference.authors}-${attack.reference.year}`;

        if (!refMap.has(key)) {
          refMap.set(key, {
            reference: attack.reference,
            attacks: [],
          });
        }

        refMap.get(key)!.attacks.push(attack);
      }
    });

    return Array.from(refMap.values());
  }, [allAttacks]);

  // Filter references based on search
  const filteredReferences = useMemo(() => {
    if (!searchQuery.trim()) return referencesWithAttacks;

    const query = searchQuery.toLowerCase();
    return referencesWithAttacks.filter(({ reference }) => {
      return (
        reference.authors?.toLowerCase().includes(query) ||
        reference.year?.toString().includes(query) ||
        reference.url?.toLowerCase().includes(query)
      );
    });
  }, [referencesWithAttacks, searchQuery]);

  // Group and sort references
  const groupedReferences = useMemo(() => {
    const sorted = [...filteredReferences].sort((a, b) => {
      if (groupBy === 'year') {
        const yearA = a.reference.year || 0;
        const yearB = b.reference.year || 0;
        return sortOrder === 'desc' ? yearB - yearA : yearA - yearB;
      } else {
        // Sort by author
        const authorA = a.reference.authors || '';
        const authorB = b.reference.authors || '';
        return sortOrder === 'desc'
          ? authorB.localeCompare(authorA)
          : authorA.localeCompare(authorB);
      }
    });

    // Group by year or author
    const groups: Record<string, ReferenceWithAttacks[]> = {};
    sorted.forEach((item) => {
      const groupKey =
        groupBy === 'year'
          ? item.reference.year?.toString() || 'Unknown'
          : item.reference.authors?.charAt(0).toUpperCase() || 'Unknown';

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }, [filteredReferences, groupBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const totalRefs = referencesWithAttacks.length;
    const totalAttacks = allAttacks.length;

    const yearCounts: Record<string, number> = {};
    referencesWithAttacks.forEach(({ reference }) => {
      const year = reference.year?.toString() || 'Unknown';
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const mostCommonYear = Object.entries(yearCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const avgAttacksPerRef = totalRefs > 0 ? (totalAttacks / totalRefs).toFixed(1) : '0';

    return {
      totalRefs,
      totalAttacks,
      mostCommonYear,
      avgAttacksPerRef,
    };
  }, [referencesWithAttacks, allAttacks]);

  const handleExport = (format: CitationFormat) => {
    if (!filteredReferences || filteredReferences.length === 0) {
      toast.error('No references to export');
      return;
    }

    const refs = filteredReferences.map((item) => item.reference);
    const content = exportAllReferences(refs, format);

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `references-${format}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${refs.length} references in ${format.toUpperCase()} format`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading references...</p>
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
        <h1 className="text-3xl font-bold mb-2">Reference Library</h1>
        <p className="text-muted-foreground">
          Browse and export research paper citations used in the attack taxonomy
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total References</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRefs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attacks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttacks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostCommonYear}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attacks/Ref</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAttacksPerRef}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by author, year, or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Group By */}
        <div className="flex gap-2">
          <Button
            variant={groupBy === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupBy('year')}
          >
            Group by Year
          </Button>
          <Button
            variant={groupBy === 'author' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupBy('author')}
          >
            Group by Author
          </Button>
        </div>

        {/* Sort Order */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </Button>

        {/* Export Dropdown */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('bibtex')}
          >
            <Download className="h-4 w-4 mr-1" />
            BibTeX
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('apa')}
          >
            <Download className="h-4 w-4 mr-1" />
            APA
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredReferences.length} reference{filteredReferences.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grouped References */}
      {filteredReferences.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No references found matching your search. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedReferences).map(([groupKey, items]) => (
            <div key={groupKey}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold">{groupKey}</h2>
                <Badge variant="secondary">{items.length} references</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map(({ reference, attacks }, index) => (
                  <ReferenceCard
                    key={`${groupKey}-${index}`}
                    reference={reference}
                    attackCount={attacks.length}
                    attacks={attacks}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Dialog */}
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}
