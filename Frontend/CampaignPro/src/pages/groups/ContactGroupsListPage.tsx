import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, UsersRound, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContactGroups, useCreateContactGroup, useDeleteContactGroup } from '../../hooks/useContactGroups';
import { Modal } from '../../components/modals/Modal';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { FormField } from '../../components/forms/FormField';
import { EmptyState } from '../../components/empty-states/EmptyState';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { TableSkeleton } from '../../components/loaders/TableSkeleton';
import { formatDate, formatNumber } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';
import type { ContactGroupResponse } from '../../types/contactGroup';

const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export function ContactGroupsListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ContactGroupResponse | null>(null);
  const navigate = useNavigate();

  const groupsQuery = useContactGroups();
  const createGroup = useCreateContactGroup();
  const deleteGroup = useDeleteContactGroup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormValues>({ resolver: zodResolver(groupSchema) });

  async function onCreate(values: GroupFormValues) {
    try {
      await createGroup.mutateAsync({ name: values.name, description: values.description || undefined });
      toast.success('Contact group created.');
      reset();
      setCreateOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleConfirmDelete() {
    if (!groupToDelete) return;
    try {
      await deleteGroup.mutateAsync(groupToDelete.id);
      toast.success('Contact group deleted.');
      setGroupToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contact Groups</h1>
          <p className="page-subtitle">Organize contacts into groups for targeted campaigns.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Create Group
        </button>
      </div>

      <div className="card">
        {groupsQuery.isLoading && <TableSkeleton rows={4} columns={4} />}

        {groupsQuery.isError && (
          <ErrorState message={getErrorMessage(groupsQuery.error)} onRetry={() => groupsQuery.refetch()} />
        )}

        {groupsQuery.data && groupsQuery.data.length === 0 && (
          <EmptyState
            icon={<UsersRound size={26} />}
            title="No contact groups yet"
            description="Create a group to organize your contacts for campaigns."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
                <Plus size={14} /> Create Group
              </button>
            }
          />
        )}

        {groupsQuery.data && groupsQuery.data.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Members</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupsQuery.data.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <Link to={ROUTES.contactGroupDetail(group.id)} style={{ fontWeight: 600 }}>
                        {group.name}
                      </Link>
                    </td>
                    <td>{group.description || '—'}</td>
                    <td>{formatNumber(group.memberCount)}</td>
                    <td>{formatDate(group.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => navigate(ROUTES.contactGroupDetail(group.id))}
                          aria-label={`View ${group.name}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setGroupToDelete(group)}
                          aria-label={`Delete ${group.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Contact Group"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="create-group-form" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" />}
              Create Group
            </button>
          </>
        }
      >
        <form id="create-group-form" onSubmit={handleSubmit(onCreate)} noValidate>
          <FormField label="Group name" htmlFor="name" error={errors.name?.message} required>
            <input id="name" className={`form-input ${errors.name ? 'has-error' : ''}`} {...register('name')} />
          </FormField>
          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <textarea id="description" className="form-textarea" rows={3} {...register('description')} />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(groupToDelete)}
        title="Delete contact group"
        message={`Are you sure you want to delete "${groupToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteGroup.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setGroupToDelete(null)}
      />
    </div>
  );
}
