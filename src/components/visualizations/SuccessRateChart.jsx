import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFilterStore } from '../../store/filterStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#eab308',
};

export default function SuccessRateChart() {
  const { filteredAttacks } = useFilterStore();

  // Get top 15 attacks by success rate
  const data = filteredAttacks
    .filter(attack => attack.successRate !== null)
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 15)
    .map(attack => ({
      name: attack.item.length > 30 ? attack.item.substring(0, 30) + '...' : attack.item,
      fullName: attack.item,
      successRate: attack.successRate,
      severity: attack.severity,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Attacks by Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No attack success rate data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 15 Attacks by Success Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              label={{ value: 'Success Rate (%)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold text-sm mb-1">{data.fullName}</p>
                      <p className="text-sm">Success Rate: {data.successRate.toFixed(1)}%</p>
                      <p className="text-sm capitalize">Severity: {data.severity}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="successRate" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
