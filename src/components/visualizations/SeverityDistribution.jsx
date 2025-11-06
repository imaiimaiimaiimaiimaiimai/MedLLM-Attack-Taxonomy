import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFilterStore } from '../../store/filterStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#eab308',
};

export default function SeverityDistribution() {
  const { filteredAttacks, toggleFilter } = useFilterStore();

  // Count attacks by severity
  const severityCounts = filteredAttacks.reduce((acc, attack) => {
    acc[attack.severity] = (acc[attack.severity] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(severityCounts).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
    severity: severity,
    percentage: ((count / filteredAttacks.length) * 100).toFixed(1),
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleClick = (entry) => {
    toggleFilter('severities', entry.severity);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attack Severity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.severity]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold text-sm">{data.name}</p>
                      <p className="text-sm">Count: {data.value}</p>
                      <p className="text-sm">Percentage: {data.percentage}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to filter</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
