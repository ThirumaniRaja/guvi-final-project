import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContact, useDeleteContact } from '../../hooks/useContacts';
import { PageSpinner } from '../../components/loaders/PageSpinner';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const contactId = Number(id);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const contactQuery = useContact(contactId);
  const deleteContact = useDeleteContact();

  if (contactQuery.isLoading) return <PageSpinner />;

  if (contactQuery.isError) {
    return <ErrorState message={getErrorMessage(contactQuery.error)} onRetry={() => contactQuery.refetch()} />;
  }

  const contact = contactQuery.data;
  if (!contact) return null;

  async function handleDelete() {
    try {
      await deleteContact.mutateAsync(contactId);
      toast.success('Contact deleted.');
      navigate(ROUTES.contacts);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.contacts)}>
            <ArrowLeft size={14} /> Back to contacts
          </button>
          <h1 className="page-title mt-2">{[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.contactEdit(contact.id)} className="btn btn-secondary">
            <Pencil size={14} /> Edit
          </Link>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <dl className="grid-2">
          <div>
            <dt className="text-muted" style={{ fontSize: 12 }}>Email</dt>
            <dd style={{ fontWeight: 600 }}>{contact.email}</dd>
          </div>
          <div>
            <dt className="text-muted" style={{ fontSize: 12 }}>Status</dt>
            <dd><StatusBadge status={contact.status} /></dd>
          </div>
          <div>
            <dt className="text-muted" style={{ fontSize: 12 }}>Company</dt>
            <dd>{contact.company || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted" style={{ fontSize: 12 }}>Phone</dt>
            <dd>{contact.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted" style={{ fontSize: 12 }}>Created</dt>
            <dd>{formatDate(contact.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete contact"
        message={`Are you sure you want to delete ${contact.email}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteContact.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
