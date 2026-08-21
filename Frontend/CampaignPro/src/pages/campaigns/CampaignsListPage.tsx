import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Send, Eye } from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { DataTable } from '../../components/tables/DataTable';
import type { DataTableColumn } from '../../components/tables/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/empty-states/EmptyState';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';
import type { CampaignResponse } from '../../types/campaign';

const PAGE_SIZE = 10;

export function CampaignsListPage() {
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const campaignsQuery = useCampaigns({ page, size: PAGE_SIZE, sort: ['createdAt,desc'] });

  const columns: DataTableColumn<CampaignResponse>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <Link to={ROUTES.campaignDetail(row.id)} style={{ fontWeight: 600 }}>
          {row.name}
        </Link>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'template', header: 'Template', render: (row) => row.templateName },
    { key: 'recipients', header: 'Recipients', render: (row) => formatNumber(row.recipientCount) },
    { key: 'scheduledAt', header: 'Scheduled', render: (row) => formatDateTime(row.scheduledAt) },
    { key: 'createdAt', header: 'Created', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="table-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => navigate(ROUTES.campaignDetail(row.id))}
            aria-label={`View ${row.name}`}
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Create, schedule and track your email campaigns.</p>
        </div>
        <Link to={ROUTES.campaignNew} className="btn btn-primary">
          <Plus size={16} /> Create Campaign
        </Link>
      </div>

      <div className="card">
        {campaignsQuery.isError && (
          <ErrorState message={getErrorMessage(campaignsQuery.error)} onRetry={() => campaignsQuery.refetch()} />
        )}

        {!campaignsQuery.isError && (
          <DataTable
            columns={columns}
            data={campaignsQuery.data?.content ?? []}
            rowKey={(row) => row.id}
            loading={campaignsQuery.isLoading}
            emptyState={
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
            }
          />
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
