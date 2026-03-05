import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface GravityChartProps {
  readings: { date: string; gravity: number; temp?: number }[];
  targetFG?: number;
}

export default function GravityChart({ readings, targetFG }: GravityChartProps) {
  if (!readings || readings.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-brewery-500 text-sm">
        No gravity readings recorded
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={readings} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#c08a3e' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v ? v.slice(5) : ''}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#c08a3e' }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            background: '#24180b',
            border: '1px solid #5c3e1940',
            borderRadius: 8,
            fontSize: 11,
          }}
          labelStyle={{ color: '#c08a3e' }}
        />
        <Line
          type="monotone"
          dataKey="gravity"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 4, fill: '#f59e0b', stroke: '#24180b', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#f59e0b' }}
        />
        {targetFG && (
          <ReferenceLine
            y={targetFG}
            stroke="#10B981"
            strokeDasharray="6 3"
            label={{ value: `FG: ${targetFG}`, fill: '#10B981', fontSize: 10, position: 'right' }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
