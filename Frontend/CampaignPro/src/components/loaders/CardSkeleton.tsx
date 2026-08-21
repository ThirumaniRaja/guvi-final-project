import { Skeleton } from './Skeleton';

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="kpi-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div className="kpi-card" key={index}>
          <Skeleton width={100} height={12} />
          <Skeleton width={80} height={26} style={{ marginTop: 10 }} />
        </div>
      ))}
    </div>
  );
}
