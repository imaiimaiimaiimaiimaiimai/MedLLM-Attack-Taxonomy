import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Download, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { NoComparison } from '../empty-states/NoComparison';

/**
 * Calculate similarity between two attacks
 */
function calculateSimilarity(attack1, attack2) {
  let score = 0;
  let factors = 0;

  // Modality similarity (Jaccard)
  if (attack1.modalities && attack2.modalities) {
    const set1 = new Set(attack1.modalities);
    const set2 = new Set(attack2.modalities);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const modalityScore = union.size > 0 ? intersection.size / union.size : 0;
    score += modalityScore * 30; // 30% weight
    factors++;
  }

  // Attack type similarity (Jaccard)
  if (attack1.attackTypes && attack2.attackTypes) {
    const set1 = new Set(attack1.attackTypes);
    const set2 = new Set(attack2.attackTypes);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const typeScore = union.size > 0 ? intersection.size / union.size : 0;
    score += typeScore * 30; // 30% weight
    factors++;
  }

  // Severity similarity
  const severityMap = { critical: 4, high: 3, medium: 2, low: 1 };
  const sev1 = severityMap[attack1.severity] || 0;
  const sev2 = severityMap[attack2.severity] || 0;
  const severityScore = 1 - Math.abs(sev1 - sev2) / 3;
  score += severityScore * 20; // 20% weight
  factors++;

  // Success rate similarity
  if (attack1.successRate !== null && attack2.successRate !== null) {
    const rateScore = 1 - Math.abs(attack1.successRate - attack2.successRate) / 100;
    score += rateScore * 20; // 20% weight
    factors++;
  }

  return factors > 0 ? score / factors * 100 : 0;
}

export default function ComparisonMatrix({ attacks, onRemove, onExport }) {
  // Calculate similarities
  const similarities = useMemo(() => {
    const sims = [];
    for (let i = 0; i < attacks.length; i++) {
      for (let j = i + 1; j < attacks.length; j++) {
        sims.push({
          pair: `${attacks[i].item} ↔ ${attacks[j].item}`,
          score: calculateSimilarity(attacks[i], attacks[j]),
        });
      }
    }
    return sims.sort((a, b) => b.score - a.score);
  }, [attacks]);

  // Comparison features
  const features = [
    { key: 'item', label: 'Attack Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'severity', label: 'Severity', type: 'severity' },
    { key: 'successRate', label: 'Success Rate', type: 'number' },
    { key: 'modalities', label: 'Modalities', type: 'array' },
    { key: 'attackTypes', label: 'Attack Types', type: 'array' },
    { key: 'tags', label: 'Tags', type: 'array' },
    { key: 'reference.year', label: 'Year Published', type: 'number' },
    { key: 'reference.authors', label: 'Authors', type: 'text' },
  ];

  // Get nested value
  const getValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Render cell value
  const renderValue = (attack, feature) => {
    const value = getValue(attack, feature.key);

    switch (feature.type) {
      case 'severity':
        const severityColors = {
          critical: 'critical',
          high: 'warning',
          medium: 'secondary',
        };
        return (
          <Badge variant={severityColors[value]} className="capitalize">
            {value}
          </Badge>
        );

      case 'array':
        if (!value || value.length === 0) return <span className="text-muted-foreground">N/A</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((item, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {item}
              </Badge>
            ))}
            {value.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 3}
              </Badge>
            )}
          </div>
        );

      case 'number':
        if (feature.key === 'successRate') {
          return value !== null ? `${value.toFixed(1)}%` : 'N/A';
        }
        return value || 'N/A';

      default:
        return value || 'N/A';
    }
  };

  // Find best/worst values for highlighting
  const getBestWorst = (feature) => {
    if (feature.type !== 'number' && feature.type !== 'severity') return { best: null, worst: null };

    const values = attacks.map((a) => getValue(a, feature.key)).filter((v) => v !== null && v !== undefined);

    if (values.length === 0) return { best: null, worst: null };

    if (feature.type === 'severity') {
      const severityMap = { critical: 4, high: 3, medium: 2, low: 1 };
      const nums = values.map((v) => severityMap[v]);
      return {
        best: values[nums.indexOf(Math.min(...nums))],
        worst: values[nums.indexOf(Math.max(...nums))],
      };
    }

    return {
      best: Math.max(...values),
      worst: Math.min(...values),
    };
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Feature', ...attacks.map((a) => a.item)];
    const rows = features.map((feature) => [
      feature.label,
      ...attacks.map((attack) => {
        const value = getValue(attack, feature.key);
        if (Array.isArray(value)) return value.join('; ');
        return value || 'N/A';
      }),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attack-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Comparison exported to CSV');
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    let md = `# Attack Comparison\n\n`;
    md += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Similarities
    if (similarities.length > 0) {
      md += `## Similarity Scores\n\n`;
      similarities.forEach(({ pair, score }) => {
        md += `- ${pair}: **${score.toFixed(1)}%** similar\n`;
      });
      md += `\n`;
    }

    // Comparison table
    md += `## Detailed Comparison\n\n`;
    md += `| Feature | ${attacks.map((a) => a.item).join(' | ')} |\n`;
    md += `|${'-'.repeat(15)}|${attacks.map(() => '-'.repeat(20)).join('|')}|\n`;

    features.forEach((feature) => {
      const values = attacks.map((attack) => {
        const value = getValue(attack, feature.key);
        if (Array.isArray(value)) return value.join(', ');
        return value || 'N/A';
      });
      md += `| ${feature.label} | ${values.join(' | ')} |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attack-comparison-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Comparison exported to Markdown');
  };

  if (attacks.length === 0) {
    return <NoComparison />;
  }

  return (
    <div className="space-y-4">
      {/* Header with export options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comparing {attacks.length} Attacks</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
                <Download className="h-4 w-4 mr-1" />
                Export Markdown
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Similarity Scores */}
      {similarities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Similarity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {similarities.map(({ pair, score }, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{pair}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-[50px] text-right">
                      {score.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Comparison Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold bg-muted">Feature</th>
                  {attacks.map((attack) => (
                    <th key={attack.id} className="py-3 px-4 bg-muted">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm">{attack.item}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRemove(attack.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => {
                  const { best, worst } = getBestWorst(feature);
                  return (
                    <tr key={feature.key} className="border-b hover:bg-accent/50">
                      <td className="py-3 px-4 font-medium text-sm">{feature.label}</td>
                      {attacks.map((attack) => {
                        const value = getValue(attack, feature.key);
                        const isBest = value === best && best !== null;
                        const isWorst = value === worst && worst !== null;

                        return (
                          <td
                            key={attack.id}
                            className={`py-3 px-4 ${
                              isBest
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : isWorst
                                ? 'bg-red-50 dark:bg-red-900/20'
                                : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {renderValue(attack, feature)}
                              {isBest && <TrendingUp className="h-4 w-4 text-green-600" />}
                              {isWorst && <TrendingDown className="h-4 w-4 text-red-600" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
