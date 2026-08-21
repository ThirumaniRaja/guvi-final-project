import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MousePointerClick, Send, AlertTriangle, BarChart3 } from 'lucide-react';
import { useAnalyticsOverview } from '../../hooks/useAnalytics';
import { useCampaigns } from '../../hooks/useCampaigns';
import { KpiCard } from '../../components/charts/KpiCard';
import { DistributionDonutChart } from '../../components/charts/DistributionDonutChart';
import { CardSkeleton } from '../../components/loaders/CardSkeleton';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { EmptyState } from '../../components/empty-states/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatNumber } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

const PAGE_SIZE = 8;

export function AnalyticsPage() {
  const [page, setPage] = useState(0);
  const overviewQuery = useAnalyticsOverview();
  const campaignsQuery = useCampaigns({ page, size: PAGE_SIZE, sort: ['createdAt,desc'] });

  const overview = overviewQuery.data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Overall performance across all your email campaigns.</p>
        </div>
      </div>

      {overviewQuery.isLoading && <CardSkeleton count={5} />}

      {overviewQuery.isError && (
        <div className="card mb-4">
          <ErrorState message={getErrorMessage(overviewQuery.error)} onRetry={() => overviewQuery.refetch()} />
        </div>
      )}

      {overview && (
        <div className="kpi-grid">
          <KpiCard label="Total Campaigns" value={formatNumber(overview.totalCampaigns)} icon={<Send size={18} />} variant="primary" />
          <KpiCard label="Total Sent" value={formatNumber(overview.totalSent)} icon={<Mail size={18} />} variant="info" />
          <KpiCard label="Total Opened" value={formatNumber(overview.totalOpened)} icon={<Mail size={18} />} variant="success" />
          <KpiCard label="Total Clicked" value={formatNumber(overview.totalClicked)} icon={<MousePointerClick size={18} />} variant="warning" />
          <KpiCard label="Total Failed" value={formatNumber(overview.totalFailed)} icon={<AlertTriangle size={18} />} variant="danger" />
        </div>
      )}

      {overview && (
        <div className="card mb-4">
          <div className="card-header">
            <h2 className="section-title">Engagement Distribution</h2>
          </div>
          <DistributionDonutChart
            data={[
              { name: 'Opened', value: overview.totalOpened, color: '#16a34a' },
              { name: 'Clicked', value: overview.totalClicked, color: '#d97706' },
              { name: 'Failed', value: overview.totalFailed, color: '#dc2626' },
            ]}
          />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Campaign Performance</h2>
        </div>
        <p className="text-muted mb-4" style={{ fontSize: 13 }}>
          Select a campaign to view its detailed analytics.
        </p>

        {campaignsQuery.isError && (
          <ErrorState message={getErrorMessage(campaignsQuery.error)} onRetry={() => campaignsQuery.refetch()} />
        )}

        {campaignsQuery.data && campaignsQuery.data.content.length === 0 && (
          <EmptyState icon={<BarChart3 size={26} />} title="No analytics data available" description="Create and send a campaign to see performance data." />
        )}

        {campaignsQuery.data && campaignsQuery.data.content.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {campaignsQuery.data.content.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <Link to={`${ROUTES.campaignDetail(campaign.id)}?tab=analytics`}>{campaign.name}</Link>
                    </td>
                    <td>
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td>{formatNumber(campaign.recipientCount)}</td>
                    <td>{formatDate(campaign.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {campaignsQuery.data && (
          <Pagination
            page={campaignsQuery.data.page}
            totalPages={campaignsQuery.data.totalPages}
            totalElements={campaignsQuery.data.totalElements}
            pageSize={campaignsQuery.data.size}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
