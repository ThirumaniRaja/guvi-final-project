import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContacts, useDeleteContact } from '../../hooks/useContacts';
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
import { ROUTES } from '../../constants/routes';
import type { ContactResponse } from '../../types/contact';

const PAGE_SIZE = 10;

export function ContactsListPage() {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [contactToDelete, setContactToDelete] = useState<ContactResponse | null>(null);
  const navigate = useNavigate();

  const contactsQuery = useContacts({ query: query || undefined, page, size: PAGE_SIZE, sort: ['createdAt,desc'] });
  const deleteContact = useDeleteContact();

  const columns: DataTableColumn<ContactResponse>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <Link to={ROUTES.contactEdit(row.id)} style={{ fontWeight: 600 }}>
          {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
        </Link>
      ),
    },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'company', header: 'Company', render: (row) => row.company || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="table-actions">
          <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate(ROUTES.contactEdit(row.id))} aria-label={`Edit ${row.email}`}>
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => setContactToDelete(row)}
            aria-label={`Delete ${row.email}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  async function handleConfirmDelete() {
    if (!contactToDelete) return;
    try {
      await deleteContact.mutateAsync(contactToDelete.id);
      toast.success('Contact deleted.');
      setContactToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Manage the people you send campaigns to.</p>
        </div>
        <Link to={ROUTES.contactNew} className="btn btn-primary">
          <Plus size={16} /> Add Contact
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(0);
            }}
            placeholder="Search contacts..."
          />
        </div>

        {contactsQuery.isError && (
          <ErrorState message={getErrorMessage(contactsQuery.error)} onRetry={() => contactsQuery.refetch()} />
        )}

        {!contactsQuery.isError && (
          <DataTable
            columns={columns}
            data={contactsQuery.data?.content ?? []}
            rowKey={(row) => row.id}
            loading={contactsQuery.isLoading}
            emptyState={
              <EmptyState
                icon={<Users size={26} />}
                title={query ? 'No contacts match your search' : 'No contacts found'}
                description={query ? 'Try a different search term.' : 'Add your first contact to get started.'}
                action={
                  !query && (
                    <Link to={ROUTES.contactNew} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Contact
                    </Link>
                  )
                }
              />
            }
          />
        )}

        {contactsQuery.data && (
          <Pagination
            page={contactsQuery.data.page}
            totalPages={contactsQuery.data.totalPages}
            totalElements={contactsQuery.data.totalElements}
            pageSize={contactsQuery.data.size}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(contactToDelete)}
        title="Delete contact"
        message={`Are you sure you want to delete ${contactToDelete?.email}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteContact.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setContactToDelete(null)}
      />
    </div>
  );
}
