import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface DataPoint {
  time: string;
  value: number;
}

interface HealthChartProps {
  title: string;
  unit: string;
  data: DataPoint[];
  color: string;
  domain?: [number | 'auto', number | 'auto'];
}

export default function HealthChart({ title, unit, data, color, domain }: HealthChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'oklch(0.556 0 0)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={domain ?? ['auto', 'auto']}
              tick={{ fontSize: 10, fill: 'oklch(0.556 0 0)' }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid oklch(0.922 0 0)',
                boxShadow: '0 2px 8px oklch(0 0 0 / 0.08)',
              }}
              formatter={(value) => [`${value} ${unit}`, title]}
              labelStyle={{ color: 'oklch(0.556 0 0)', marginBottom: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
