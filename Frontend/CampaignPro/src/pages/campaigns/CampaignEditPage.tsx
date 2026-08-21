import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCampaign, useUpdateCampaign } from '../../hooks/useCampaigns';
import { useTemplates } from '../../hooks/useTemplates';
import { FormField } from '../../components/forms/FormField';
import { PageSpinner } from '../../components/loaders/PageSpinner';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

const editSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  templateId: z.number().int().positive('Please select a template'),
});

type EditFormValues = z.infer<typeof editSchema>;

export function CampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const navigate = useNavigate();

  const campaignQuery = useCampaign(campaignId);
  const templatesQuery = useTemplates({ page: 0, size: 100, sort: ['name,asc'] });
  const updateCampaign = useUpdateCampaign();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) });

  useEffect(() => {
    if (campaignQuery.data) {
      reset({ name: campaignQuery.data.name, templateId: campaignQuery.data.templateId });
    }
  }, [campaignQuery.data, reset]);

  if (campaignQuery.isLoading || templatesQuery.isLoading) return <PageSpinner />;

  async function onSubmit(values: EditFormValues) {
    try {
      await updateCampaign.mutateAsync({ id: campaignId, payload: values });
      toast.success('Campaign updated.');
      navigate(ROUTES.campaignDetail(campaignId));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.campaignDetail(campaignId))}>
            <ArrowLeft size={14} /> Back to campaign
          </button>
          <h1 className="page-title mt-2">Edit Campaign</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Campaign name" htmlFor="name" error={errors.name?.message} required>
            <input id="name" className={`form-input ${errors.name ? 'has-error' : ''}`} {...register('name')} />
          </FormField>

          <FormField label="Template" htmlFor="templateId" error={errors.templateId?.message} required>
            <select
              id="templateId"
              className={`form-select ${errors.templateId ? 'has-error' : ''}`}
              {...register('templateId', { valueAsNumber: true })}
            >
              {templatesQuery.data?.content.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" />}
              Save changes
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(ROUTES.campaignDetail(campaignId))}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
