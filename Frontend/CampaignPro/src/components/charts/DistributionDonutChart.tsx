import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DistributionChartProps {
  data: { name: string; value: number; color: string }[];
}

export function DistributionDonutChart({ data }: DistributionChartProps) {
    console.log('DistributionDonutChart data:', data); // Debugging line to check the data being passed
  const hasData = data.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center text-muted" style={{ height: 240 }}>
        No analytics data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
