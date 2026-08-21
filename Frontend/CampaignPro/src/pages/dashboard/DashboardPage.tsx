import { Link } from 'react-router-dom';
import { Send, Mail, MousePointerClick, Plus, BarChart3 } from 'lucide-react';
import { useAnalyticsOverview } from '../../hooks/useAnalytics';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useAuth } from '../../context/AuthContext';
import { KpiCard } from '../../components/charts/KpiCard';
import { DistributionDonutChart } from '../../components/charts/DistributionDonutChart';
import { CardSkeleton } from '../../components/loaders/CardSkeleton';
import { TableSkeleton } from '../../components/loaders/TableSkeleton';
import { EmptyState } from '../../components/empty-states/EmptyState';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatNumber, formatPercent } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

export function DashboardPage() {
  const { user } = useAuth();
  const overviewQuery = useAnalyticsOverview();
  const campaignsQuery = useCampaigns({ page: 0, size: 5, sort: ['createdAt,desc'] });

  const overview = overviewQuery.data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          <p className="page-subtitle">Here&apos;s what&apos;s happening with your email campaigns.</p>
        </div>
        <Link to={ROUTES.campaignNew} className="btn btn-primary">
          <Plus size={16} /> Create Campaign
        </Link>
      </div>

      {overviewQuery.isLoading && <CardSkeleton count={4} />}

      {overviewQuery.isError && (
        <div className="card mb-4">
          <ErrorState message={getErrorMessage(overviewQuery.error)} onRetry={() => overviewQuery.refetch()} />
        </div>
      )}

      {overview && (
        <div className="kpi-grid">
          <KpiCard label="Total Campaigns" value={formatNumber(overview.totalCampaigns)} icon={<Send size={18} />} variant="primary" />
          <KpiCard label="Emails Sent" value={formatNumber(overview.totalSent)} icon={<Mail size={18} />} variant="info" />
          <KpiCard label="Overall Open Rate" value={formatPercent(overview.overallOpenRate)} icon={<Mail size={18} />} variant="success" />
          <KpiCard
            label="Overall Click Rate"
            value={formatPercent(overview.overallClickRate)}
            icon={<MousePointerClick size={18} />}
            variant="warning"
          />
        </div>
      )}

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Engagement Distribution</h2>
          </div>
          {overviewQuery.isLoading && <CardSkeleton count={1} />}
          {overview && (
            <DistributionDonutChart
              data={[
                { name: 'Opened', value: overview.totalOpened, color: '#16a34a' },
                { name: 'Clicked', value: overview.totalClicked, color: '#d97706' },
                { name: 'Failed', value: overview.totalFailed, color: '#dc2626' },
              ]}
            />
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Quick Links</h2>
          </div>
          <div className="flex flex-col gap-3">
            <Link to={ROUTES.contacts} className="btn btn-secondary w-full">
              Manage Contacts
            </Link>
            <Link to={ROUTES.templates} className="btn btn-secondary w-full">
              Manage Email Templates
            </Link>
            <Link to={ROUTES.analytics} className="btn btn-secondary w-full">
              <BarChart3 size={16} /> View Full Analytics
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Recent Campaigns</h2>
          <Link to={ROUTES.campaigns} className="btn btn-ghost btn-sm">
            View all
          </Link>
        </div>

        {campaignsQuery.isLoading && <TableSkeleton rows={5} columns={4} />}

        {campaignsQuery.isError && (
          <ErrorState message={getErrorMessage(campaignsQuery.error)} onRetry={() => campaignsQuery.refetch()} />
        )}

        {campaignsQuery.data && campaignsQuery.data.content.length === 0 && (
          <EmptyState
            icon={<Send size={26} />}
            title="No campaigns created yet"
            description="Create your first campaign to start reaching your audience."
            action={
              <Link to={ROUTES.campaignNew} className="btn btn-primary btn-sm">
                <Plus size={14} /> Create Campaign
              </Link>
            }
          />
        )}

        {campaignsQuery.data && campaignsQuery.data.content.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {campaignsQuery.data.content.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <Link to={ROUTES.campaignDetail(campaign.id)}>{campaign.name}</Link>
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
      </div>
    </div>
  );
}
