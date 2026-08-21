import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTemplate } from '../../hooks/useTemplates';
import { usePreviewTemplate } from '../../hooks/useTemplates';
import { PageSpinner } from '../../components/loaders/PageSpinner';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

export function TemplatePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const templateId = Number(id);
  const navigate = useNavigate();
  const [variables, setVariables] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);

  const templateQuery = useTemplate(templateId);
  const previewTemplate = usePreviewTemplate();

  if (templateQuery.isLoading) return <PageSpinner />;
  if (templateQuery.isError) {
    return <ErrorState message={getErrorMessage(templateQuery.error)} onRetry={() => templateQuery.refetch()} />;
  }

  async function handlePreview() {
    const variablesRecord = Object.fromEntries(
      variables.filter((entry) => entry.key.trim().length > 0).map((entry) => [entry.key.trim(), entry.value]),
    );
    try {
      await previewTemplate.mutateAsync({ id: templateId, payload: { variables: variablesRecord } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.templates)}>
            <ArrowLeft size={14} /> Back to templates
          </button>
          <h1 className="page-title mt-2">Preview: {templateQuery.data?.name}</h1>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section-title mb-4">Variables</h2>
          <p className="text-muted mb-4" style={{ fontSize: 13 }}>
            Provide sample values for any placeholders used in this template (e.g. firstName, companyName).
          </p>
          {variables.map((entry, index) => (
            <div key={index} className="form-row mb-4">
              <input
                className="form-input"
                placeholder="Variable name"
                value={entry.key}
                onChange={(event) => {
                  const next = [...variables];
                  next[index] = { ...next[index], key: event.target.value };
                  setVariables(next);
                }}
              />
              <div className="flex gap-2">
                <input
                  className="form-input"
                  placeholder="Value"
                  value={entry.value}
                  onChange={(event) => {
                    const next = [...variables];
                    next[index] = { ...next[index], value: event.target.value };
                    setVariables(next);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => setVariables(variables.filter((_, i) => i !== index))}
                  aria-label="Remove variable"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVariables([...variables, { key: '', value: '' }])}>
              <Plus size={14} /> Add variable
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePreview} disabled={previewTemplate.isPending}>
              {previewTemplate.isPending && <span className="spinner" />}
              Generate Preview
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Rendered Preview</h2>
          {previewTemplate.data ? (
            <div>
              <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                Subject: {previewTemplate.data.subject}
              </p>
              <iframe
                title="Template preview"
                srcDoc={previewTemplate.data.html}
                style={{ width: '100%', height: 420, border: '1px solid var(--color-border)', borderRadius: 8 }}
                sandbox=""
              />
            </div>
          ) : (
            <p className="text-muted">Generate a preview to see the rendered email.</p>
          )}
        </div>
      </div>
    </div>
  );
}
