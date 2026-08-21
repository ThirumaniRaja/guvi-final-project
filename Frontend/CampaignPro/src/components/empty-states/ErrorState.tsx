import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <AlertTriangle size={26} />
      </div>
      <div className="empty-state-title">Something went wrong</div>
      <p className="empty-state-description">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCcw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
