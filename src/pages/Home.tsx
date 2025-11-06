import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Shield, Search, BarChart3 } from 'lucide-react';
import TaxonomyTreeLanding from '../components/visualizations/TaxonomyTreeLanding';
import { useFilterStore } from '../store/filterStore';
import { loadAttacksData } from '../data/dataProcessor';

export default function Home() {
  const navigate = useNavigate();
  const { setAllAttacks, setLoading, setError, loading } = useFilterStore();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Medical AI Security Research
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Medical LLM Attack Taxonomy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore and analyze adversarial attacks on medical AI systems through interactive visualizations and comprehensive data exploration
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => navigate('/explorer')} className="gap-2">
              <Search className="h-5 w-5" />
              Explore Attacks
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
              <BarChart3 className="h-5 w-5" />
              View Dashboard
            </Button>
          </div>
        </div>

        {/* Taxonomy Tree Visualization */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Attack Taxonomy Tree</h2>
            <p className="text-muted-foreground">
              Hierarchical visualization of adversarial attacks categorized by type and severity
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96 bg-card rounded-lg border">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                <p className="text-muted-foreground">Loading taxonomy...</p>
              </div>
            </div>
          ) : (
            <TaxonomyTreeLanding />
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Explorer</h3>
            <p className="text-muted-foreground">
              Filter, search, and compare attacks with advanced filtering and real-time search capabilities
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Rich Visualizations</h3>
            <p className="text-muted-foreground">
              Explore data through interactive charts, heatmaps, network graphs, and taxonomy trees
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Research-Ready</h3>
            <p className="text-muted-foreground">
              Export data, citations, and comparisons for academic research and security analysis
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center">
          <div className="inline-flex flex-wrap gap-12 justify-center p-8 bg-card rounded-lg border">
            <div>
              <div className="text-4xl font-bold text-primary mb-1">100+</div>
              <div className="text-sm text-muted-foreground">Documented Attacks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">10+</div>
              <div className="text-sm text-muted-foreground">Attack Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Research Papers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
