import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ComparisonMatrix from '../components/comparison/ComparisonMatrix';
import { useFilterStore } from '../store/filterStore';
import { loadAttacksData } from '../data/dataProcessor';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import type { Attack } from '../types/attack';

export default function Comparison() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allAttacks, setAllAttacks, setLoading, setError, loading, error } = useFilterStore();
  const [comparisonAttacks, setComparisonAttacks] = useState<Attack[]>([]);

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

    if (allAttacks.length === 0) {
      loadData();
    }
  }, [allAttacks.length, setAllAttacks, setLoading, setError]);

  // Load attacks from URL params
  useEffect(() => {
    const attackIds = searchParams.get('ids')?.split(',').filter(id => id) || [];

    console.log('Comparison page - URL params:', {
      attackIds,
      allAttacksCount: allAttacks.length,
      loading
    });

    if (attackIds.length > 0 && allAttacks.length > 0) {
      const selected = allAttacks.filter((attack) => attackIds.includes(attack.id));
      console.log('Comparison page - Selected attacks:', {
        requestedIds: attackIds,
        foundCount: selected.length,
        attacks: selected.map(a => ({ id: a.id, item: a.item }))
      });

      setComparisonAttacks(selected);

      if (selected.length < attackIds.length) {
        const missingIds = attackIds.filter(id => !selected.some(a => a.id === id));
        console.warn('Comparison page - Missing attacks:', missingIds);
        toast.error('Some attacks could not be found');
      }
    } else if (attackIds.length === 0) {
      // Clear comparison attacks if no IDs in URL
      console.log('Comparison page - No IDs in URL, clearing attacks');
      setComparisonAttacks([]);
    }
  }, [searchParams, allAttacks, loading]);

  // Update URL when attacks change
  const handleRemoveAttack = (attackId: string) => {
    const updatedAttacks = comparisonAttacks.filter((a) => a.id !== attackId);
    setComparisonAttacks(updatedAttacks);

    // Update URL
    const ids = updatedAttacks.map((a) => a.id).join(',');
    setSearchParams(ids ? { ids } : {});

    toast.success('Attack removed from comparison');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading comparison data...</p>
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/explorer')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explorer
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Attack Comparison</h1>
          <p className="text-muted-foreground">
            Side-by-side analysis of selected attacks with similarity scoring and detailed metrics
          </p>
        </div>
      </div>

      {/* Comparison Matrix */}
      <ComparisonMatrix
        attacks={comparisonAttacks}
        onRemove={handleRemoveAttack}
      />
    </div>
  );
}
