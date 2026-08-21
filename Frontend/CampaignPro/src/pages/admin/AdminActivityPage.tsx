import { Activity } from 'lucide-react';
import { useAdminActivity } from '../../hooks/useAdmin';
import { TableSkeleton } from '../../components/loaders/TableSkeleton';
import { EmptyState } from '../../components/empty-states/EmptyState';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { getErrorMessage } from '../../utils/errorMessages';

export function AdminActivityPage() {
  const activityQuery = useAdminActivity();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Activity</h1>
          <p className="page-subtitle">Recent actions taken across the platform.</p>
        </div>
      </div>

      <div className="card">
        {activityQuery.isLoading && <TableSkeleton rows={8} columns={4} />}

        {activityQuery.isError && (
          <ErrorState message={getErrorMessage(activityQuery.error)} onRetry={() => activityQuery.refetch()} />
        )}

        {activityQuery.data && activityQuery.data.recent.length === 0 && (
          <EmptyState icon={<Activity size={26} />} title="No recent activity" description="System activity will appear here as it happens." />
        )}

        {activityQuery.data && activityQuery.data.recent.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activityQuery.data.recent.map((entry, index) => (
                  <tr key={`${entry.entityType}-${entry.entityId}-${index}`}>
                    <td>{entry.action}</td>
                    <td>{entry.entityType}</td>
                    <td>{entry.entityId}</td>
                    <td>{entry.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
