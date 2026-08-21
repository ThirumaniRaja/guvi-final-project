interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, className, style }: SkeletonProps) {
  return <div className={`skeleton ${className ?? ''}`} style={{ width, height, ...style }} />;
}
