import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CampaignBarChartProps {
  data: { name: string; sent: number; opened: number; clicked: number }[];
}

export function CampaignBarChart({ data }: CampaignBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted" style={{ height: 260 }}>
        No campaign performance data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="sent" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Sent" />
        <Bar dataKey="opened" fill="#16a34a" radius={[4, 4, 0, 0]} name="Opened" />
        <Bar dataKey="clicked" fill="#d97706" radius={[4, 4, 0, 0]} name="Clicked" />
      </BarChart>
    </ResponsiveContainer>
  );
}
