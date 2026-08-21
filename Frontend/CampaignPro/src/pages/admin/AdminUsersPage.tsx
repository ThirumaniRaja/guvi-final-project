import { useState } from 'react';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminUsers, useUpdateUserStatus } from '../../hooks/useAdmin';
import { DataTable } from '../../components/tables/DataTable';
import type { DataTableColumn } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/empty-states/EmptyState';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';
import type { UserResponse } from '../../types/auth';

const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [userToToggle, setUserToToggle] = useState<UserResponse | null>(null);

  const usersQuery = useAdminUsers({ query: query || undefined, page, size: PAGE_SIZE, sort: ['createdAt,desc'] });
  const updateStatus = useUpdateUserStatus();

  const columns: DataTableColumn<UserResponse>[] = [
    { key: 'fullName', header: 'Name', render: (row) => row.fullName },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'role', header: 'Role', render: (row) => <span className="badge badge-info">{row.role}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="table-actions">
          {row.status !== 'DELETED' && (
            <button
              type="button"
              className={`btn btn-sm ${row.status === 'ACTIVE' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setUserToToggle(row)}
            >
              {row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      ),
    },
  ];

  async function handleConfirmToggle() {
    if (!userToToggle) return;
    const nextStatus = userToToggle.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateStatus.mutateAsync({ id: userToToggle.id, payload: { status: nextStatus } });
      toast.success(`User ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`);
      setUserToToggle(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View and manage all registered users.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(0);
            }}
            placeholder="Search users..."
          />
        </div>

        {usersQuery.isError && (
          <ErrorState message={getErrorMessage(usersQuery.error)} onRetry={() => usersQuery.refetch()} />
        )}

        {!usersQuery.isError && (
          <DataTable
            columns={columns}
            data={usersQuery.data?.content ?? []}
            rowKey={(row) => row.id}
            loading={usersQuery.isLoading}
            emptyState={
              <EmptyState icon={<Users size={26} />} title="No users found" description="Try adjusting your search." />
            }
          />
        )}

        {usersQuery.data && (
          <Pagination
            page={usersQuery.data.page}
            totalPages={usersQuery.data.totalPages}
            totalElements={usersQuery.data.totalElements}
            pageSize={usersQuery.data.size}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(userToToggle)}
        title={userToToggle?.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}
        message={`Are you sure you want to ${userToToggle?.status === 'ACTIVE' ? 'deactivate' : 'activate'} ${userToToggle?.fullName}?`}
        confirmLabel={userToToggle?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={userToToggle?.status === 'ACTIVE' ? 'danger' : 'primary'}
        loading={updateStatus.isPending}
        onConfirm={handleConfirmToggle}
        onCancel={() => setUserToToggle(null)}
      />
    </div>
  );
}
