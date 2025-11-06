import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useFilterStore } from '../../store/filterStore';
import { Shield, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }) {
  const variantStyles = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatsCards() {
  const { getFilteredStats } = useFilterStore();
  const stats = getFilteredStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Attacks"
        value={stats.totalAttacks}
        subtitle="Matching your filters"
        icon={Shield}
        variant="default"
      />
      <StatCard
        title="Avg Success Rate"
        value={`${stats.avgSuccessRate}%`}
        subtitle="Across documented attacks"
        icon={TrendingUp}
        variant="warning"
      />
      <StatCard
        title="Most Common Modality"
        value={stats.mostCommonModality}
        subtitle="Primary attack vector"
        icon={Activity}
        variant="success"
      />
      <StatCard
        title="Critical Attacks"
        value={stats.criticalCount}
        subtitle={`${stats.highCount} high, ${stats.mediumCount} medium severity`}
        icon={AlertTriangle}
        variant="danger"
      />
    </div>
  );
}
