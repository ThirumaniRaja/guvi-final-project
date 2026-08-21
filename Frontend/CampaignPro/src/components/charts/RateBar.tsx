interface RateBarProps {
  label: string;
  value: number;
  color: string;
}

export function RateBar({ label, value, color }: RateBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mt-2">
        <span className="section-title" style={{ fontSize: 13 }}>
          {label}
        </span>
        <span className="text-muted">{clamped.toFixed(1)}%</span>
      </div>
      <div className="progress-bar-track mt-2">
        <div className="progress-bar-fill" style={{ width: `${clamped}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
