import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContact, useCreateContact, useUpdateContact } from '../../hooks/useContacts';
import { FormField } from '../../components/forms/FormField';
import { PageSpinner } from '../../components/loaders/PageSpinner';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

const contactSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const contactId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const contactQuery = useContact(contactId);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  useEffect(() => {
    if (contactQuery.data) {
      reset({
        email: contactQuery.data.email,
        firstName: contactQuery.data.firstName ?? '',
        lastName: contactQuery.data.lastName ?? '',
        company: contactQuery.data.company ?? '',
        phone: contactQuery.data.phone ?? '',
      });
    }
  }, [contactQuery.data, reset]);

  if (isEdit && contactQuery.isLoading) {
    return <PageSpinner />;
  }

  async function onSubmit(values: ContactFormValues) {
    const payload = {
      email: values.email,
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      company: values.company || undefined,
      phone: values.phone || undefined,
    };
    try {
      if (isEdit && contactId) {
        await updateContact.mutateAsync({ id: contactId, payload });
        toast.success('Contact updated.');
      } else {
        await createContact.mutateAsync(payload);
        toast.success('Contact created.');
      }
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
          <h1 className="page-title mt-2">{isEdit ? 'Edit Contact' : 'Add Contact'}</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <input id="email" type="email" className={`form-input ${errors.email ? 'has-error' : ''}`} {...register('email')} />
          </FormField>

          <div className="form-row">
            <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message}>
              <input id="firstName" className="form-input" {...register('firstName')} />
            </FormField>
            <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
              <input id="lastName" className="form-input" {...register('lastName')} />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Company" htmlFor="company" error={errors.company?.message}>
              <input id="company" className="form-input" {...register('company')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <input id="phone" className="form-input" {...register('phone')} />
            </FormField>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" />}
              {isEdit ? 'Save changes' : 'Create contact'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(ROUTES.contacts)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
