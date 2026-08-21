import { Users, UserCheck, Send, Mail, MousePointerClick } from 'lucide-react';
import { useAdminDashboard } from '../../hooks/useAdmin';
import { KpiCard } from '../../components/charts/KpiCard';
import { DistributionDonutChart } from '../../components/charts/DistributionDonutChart';
import { CardSkeleton } from '../../components/loaders/CardSkeleton';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';

export function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard();
  const dashboard = dashboardQuery.data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System-wide statistics and platform health.</p>
        </div>
      </div>

      {dashboardQuery.isLoading && <CardSkeleton count={4} />}

      {dashboardQuery.isError && (
        <div className="card">
          <ErrorState message={getErrorMessage(dashboardQuery.error)} onRetry={() => dashboardQuery.refetch()} />
        </div>
      )}

      {dashboard && (
        <>
          <div className="kpi-grid">
            <KpiCard label="Total Users" value={formatNumber(dashboard.totalUsers)} icon={<Users size={18} />} variant="primary" />
            <KpiCard label="Active Users" value={formatNumber(dashboard.activeUsers)} icon={<UserCheck size={18} />} variant="success" />
            <KpiCard label="Total Campaigns" value={formatNumber(dashboard.totalCampaigns)} icon={<Send size={18} />} variant="info" />
            <KpiCard
              label="Overall Open Rate"
              value={formatPercent(dashboard.globalAnalytics.overallOpenRate)}
              icon={<Mail size={18} />}
              variant="warning"
            />
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 className="section-title mb-4">Platform Engagement</h2>
              <DistributionDonutChart
                data={[
                  { name: 'Opened', value: dashboard.globalAnalytics.totalOpened, color: '#16a34a' },
                  { name: 'Clicked', value: dashboard.globalAnalytics.totalClicked, color: '#d97706' },
                  { name: 'Failed', value: dashboard.globalAnalytics.totalFailed, color: '#dc2626' },
                ]}
              />
            </div>
            <div className="card">
              <h2 className="section-title mb-4">Email Volume</h2>
              <div className="kpi-grid" style={{ gridTemplateColumns: '1fr' }}>
                <KpiCard label="Total Emails Sent" value={formatNumber(dashboard.globalAnalytics.totalSent)} icon={<Mail size={18} />} variant="primary" />
                <KpiCard
                  label="Overall Click Rate"
                  value={formatPercent(dashboard.globalAnalytics.overallClickRate)}
                  icon={<MousePointerClick size={18} />}
                  variant="warning"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
