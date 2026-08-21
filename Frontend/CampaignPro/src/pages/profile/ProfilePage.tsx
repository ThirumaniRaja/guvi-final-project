import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCurrentUser, useUpdateProfile, useChangePassword } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/forms/FormField';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { PageSpinner } from '../../components/loaders/PageSpinner';
import { ErrorState } from '../../components/empty-states/ErrorState';
import { getErrorMessage } from '../../utils/errorMessages';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  organization: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { refreshUser } = useAuth();
  const currentUserQuery = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (currentUserQuery.data) {
      profileForm.reset({
        fullName: currentUserQuery.data.fullName,
        organization: currentUserQuery.data.organization ?? '',
        timezone: currentUserQuery.data.timezone ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserQuery.data]);

  if (currentUserQuery.isLoading) return <PageSpinner />;
  if (currentUserQuery.isError) {
    return <ErrorState message={getErrorMessage(currentUserQuery.error)} onRetry={() => currentUserQuery.refetch()} />;
  }

  async function onSubmitProfile(values: ProfileFormValues) {
    try {
      await updateProfile.mutateAsync({
        fullName: values.fullName,
        organization: values.organization || undefined,
        timezone: values.timezone || undefined,
      });
      await refreshUser();
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function onSubmitPassword(values: PasswordFormValues) {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed successfully.');
      passwordForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account information and security.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section-title mb-4">Profile Information</h2>
          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} noValidate>
            <FormField label="Full name" htmlFor="fullName" error={profileForm.formState.errors.fullName?.message} required>
              <input id="fullName" className={`form-input ${profileForm.formState.errors.fullName ? 'has-error' : ''}`} {...profileForm.register('fullName')} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <input id="email" className="form-input" value={currentUserQuery.data?.email ?? ''} disabled />
            </FormField>
            <FormField label="Organization" htmlFor="organization" error={profileForm.formState.errors.organization?.message}>
              <input id="organization" className="form-input" {...profileForm.register('organization')} />
            </FormField>
            <FormField label="Timezone" htmlFor="timezone" error={profileForm.formState.errors.timezone?.message} hint="e.g. America/New_York">
              <input id="timezone" className="form-input" {...profileForm.register('timezone')} />
            </FormField>
            <button type="submit" className="btn btn-primary" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting && <span className="spinner" />}
              Save changes
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} noValidate>
            <FormField label="Current password" htmlFor="currentPassword" error={passwordForm.formState.errors.currentPassword?.message} required>
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                hasError={Boolean(passwordForm.formState.errors.currentPassword)}
                {...passwordForm.register('currentPassword')}
              />
            </FormField>
            <FormField label="New password" htmlFor="newPassword" error={passwordForm.formState.errors.newPassword?.message} required>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                hasError={Boolean(passwordForm.formState.errors.newPassword)}
                {...passwordForm.register('newPassword')}
              />
            </FormField>
            <FormField
              label="Confirm new password"
              htmlFor="confirmNewPassword"
              error={passwordForm.formState.errors.confirmNewPassword?.message}
              required
            >
              <PasswordInput
                id="confirmNewPassword"
                autoComplete="new-password"
                hasError={Boolean(passwordForm.formState.errors.confirmNewPassword)}
                {...passwordForm.register('confirmNewPassword')}
              />
            </FormField>
            <button type="submit" className="btn btn-primary" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting && <span className="spinner" />}
              Change password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
