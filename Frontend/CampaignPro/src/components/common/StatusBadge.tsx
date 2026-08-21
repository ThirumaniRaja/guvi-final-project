type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  ACTIVE: 'success',
  SENT: 'success',
  DELIVERED: 'success',
  DRAFT: 'neutral',
  SCHEDULED: 'info',
  SENDING: 'warning',
  PENDING: 'warning',
  CANCELLED: 'neutral',
  FAILED: 'danger',
  BOUNCED: 'danger',
  UNSUBSCRIBED: 'warning',
  SUSPENDED: 'danger',
  DELETED: 'danger',
};

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANT_MAP[status.toUpperCase()] ?? 'neutral';
  return <span className={`badge badge-${variant}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}
