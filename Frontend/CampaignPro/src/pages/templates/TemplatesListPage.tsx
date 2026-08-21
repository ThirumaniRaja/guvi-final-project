import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Mail, Pencil, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDeleteTemplate, useTemplates } from '../../hooks/useTemplates';
import { EmptyState } from '../../components/empty-states/EmptyState';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { ConfirmDialog } from '../../components/modals/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { Skeleton } from '../../components/loaders/Skeleton';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';
import type { TemplateResponse } from '../../types/template';

const PAGE_SIZE = 9;

export function TemplatesListPage() {
  const [page, setPage] = useState(0);
  const [templateToDelete, setTemplateToDelete] = useState<TemplateResponse | null>(null);
  const navigate = useNavigate();

  const templatesQuery = useTemplates({ page, size: PAGE_SIZE, sort: ['updatedAt,desc'] });
  const deleteTemplate = useDeleteTemplate();

  async function handleConfirmDelete() {
    if (!templateToDelete) return;
    try {
      await deleteTemplate.mutateAsync(templateToDelete.id);
      toast.success('Template deleted.');
      setTemplateToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Email Templates</h1>
          <p className="page-subtitle">Create reusable templates for your campaigns.</p>
        </div>
        <Link to={ROUTES.templateNew} className="btn btn-primary">
          <Plus size={16} /> Create Template
        </Link>
      </div>

      {templatesQuery.isError && (
        <div className="card">
          <ErrorState message={getErrorMessage(templatesQuery.error)} onRetry={() => templatesQuery.refetch()} />
        </div>
      )}

      {templatesQuery.isLoading && (
        <div className="template-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="template-card" key={index}>
              <Skeleton height={140} className="template-card-preview" style={{ borderRadius: 0 }} />
              <div className="template-card-body">
                <Skeleton width="70%" height={16} />
                <Skeleton width="50%" height={12} />
              </div>
            </div>
          ))}
        </div>
      )}

      {templatesQuery.data && templatesQuery.data.content.length === 0 && (
        <div className="card">
          <EmptyState
            icon={<Mail size={26} />}
            title="No email templates available"
            description="Create your first template to start building campaigns."
            action={
              <Link to={ROUTES.templateNew} className="btn btn-primary btn-sm">
                <Plus size={14} /> Create Template
              </Link>
            }
          />
        </div>
      )}

      {templatesQuery.data && templatesQuery.data.content.length > 0 && (
        <>
          <div className="template-grid">
            {templatesQuery.data.content.map((template) => (
              <div className="template-card" key={template.id}>
                <div className="template-card-preview">
                  <iframe title={template.name} srcDoc={template.htmlBody} sandbox="" />
                </div>
                <div className="template-card-body">
                  <div className="flex items-center justify-between">
                    <span style={{ fontWeight: 700 }}>{template.name}</span>
                    <span className={`badge ${template.active ? 'badge-success' : 'badge-neutral'}`}>
                      {template.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    {template.subject}
                  </span>
                </div>
                <div className="template-card-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/templates/${template.id}/preview`)}
                  >
                    <Eye size={14} /> Preview
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(ROUTES.templateEdit(template.id))}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => setTemplateToDelete(template)}
                    aria-label={`Delete ${template.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={templatesQuery.data.page}
            totalPages={templatesQuery.data.totalPages}
            totalElements={templatesQuery.data.totalElements}
            pageSize={templatesQuery.data.size}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(templateToDelete)}
        title="Delete template"
        message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteTemplate.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTemplateToDelete(null)}
      />
    </div>
  );
}
