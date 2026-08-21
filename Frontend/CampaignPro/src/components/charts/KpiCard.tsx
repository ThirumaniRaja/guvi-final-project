import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const VARIANT_STYLES: Record<string, { bg: string; color: string }> = {
  primary: { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
  success: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  danger: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)' },
  info: { bg: 'var(--color-info-light)', color: 'var(--color-info)' },
};

export function KpiCard({ label, value, icon, variant = 'primary' }: KpiCardProps) {
  const style = VARIANT_STYLES[variant];
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between">
        <span className="kpi-card-label">{label}</span>
        <div className="kpi-card-icon" style={{ backgroundColor: style.bg, color: style.color }}>
          {icon}
        </div>
      </div>
      <div className="kpi-card-value">{value}</div>
    </div>
  );
}
