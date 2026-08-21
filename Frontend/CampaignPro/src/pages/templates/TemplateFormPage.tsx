import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateTemplate, usePreviewTemplate, useTemplate, useUpdateTemplate } from '../../hooks/useTemplates';
import { FormField } from '../../components/forms/FormField';
import { RichTextEditor } from '../../components/forms/RichTextEditor';
import { Modal } from '../../components/modals/Modal';
import { PageSpinner } from '../../components/loaders/PageSpinner';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlBody: z.string().min(1, 'Email content is required'),
  textBody: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export function TemplateFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const templateId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);

  const templateQuery = useTemplate(templateId);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const previewTemplate = usePreviewTemplate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: '', subject: '', htmlBody: '', textBody: '' },
  });

  useEffect(() => {
    if (templateQuery.data) {
      reset({
        name: templateQuery.data.name,
        subject: templateQuery.data.subject,
        htmlBody: templateQuery.data.htmlBody,
        textBody: templateQuery.data.textBody ?? '',
      });
    }
  }, [templateQuery.data, reset]);

  if (isEdit && templateQuery.isLoading) {
    return <PageSpinner />;
  }

  async function onSubmit(values: TemplateFormValues) {
    const payload = {
      name: values.name,
      subject: values.subject,
      htmlBody: values.htmlBody,
      textBody: values.textBody || undefined,
    };
    try {
      if (isEdit && templateId) {
        await updateTemplate.mutateAsync({ id: templateId, payload });
        toast.success('Template updated.');
      } else {
        await createTemplate.mutateAsync(payload);
        toast.success('Template created.');
      }
      navigate(ROUTES.templates);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handlePreview() {
    if (!templateId) return;
    try {
      await previewTemplate.mutateAsync({ id: templateId, payload: { variables: {} } });
      setPreviewOpen(true);
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
          <h1 className="page-title mt-2">{isEdit ? 'Edit Template' : 'New Template'}</h1>
        </div>
        {isEdit && (
          <button type="button" className="btn btn-secondary" onClick={handlePreview} disabled={previewTemplate.isPending}>
            {previewTemplate.isPending ? <span className="spinner spinner-dark" /> : <Eye size={16} />} Preview
          </button>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Template name" htmlFor="name" error={errors.name?.message} required>
            <input id="name" className={`form-input ${errors.name ? 'has-error' : ''}`} {...register('name')} />
          </FormField>

          <FormField label="Subject" htmlFor="subject" error={errors.subject?.message} required>
            <input id="subject" className={`form-input ${errors.subject ? 'has-error' : ''}`} {...register('subject')} />
          </FormField>

          <FormField label="Email content" htmlFor="htmlBody" error={errors.htmlBody?.message} required>
            <Controller
              control={control}
              name="htmlBody"
              render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
            />
          </FormField>

          <FormField label="Plain text version" htmlFor="textBody" error={errors.textBody?.message} hint="Optional fallback for email clients that don't support HTML.">
            <textarea id="textBody" className="form-textarea" rows={4} {...register('textBody')} />
          </FormField>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" />}
              {isEdit ? 'Save changes' : 'Create template'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(ROUTES.templates)}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Template Preview" size="lg">
        {previewTemplate.data && (
          <div>
            <p className="section-title mb-4">Subject: {previewTemplate.data.subject}</p>
            <iframe title="Template preview" srcDoc={previewTemplate.data.html} style={{ width: '100%', height: 480, border: '1px solid var(--color-border)', borderRadius: 8 }} sandbox="" />
          </div>
        )}
      </Modal>
    </div>
  );
}
