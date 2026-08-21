import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Megaphone, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { FormField } from '../../components/forms/FormField';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    organization: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setApiError(null);
    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        organization: values.organization || undefined,
        password: values.password,
      });
      toast.success('Account created successfully!');
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Megaphone size={24} />
          CampaignPro
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start managing your email campaigns today.</p>

        {apiError && <div className="auth-alert">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message} required>
            <div className="input-with-icon">
              <User size={16} />
              <input
                id="fullName"
                className={`form-input ${errors.fullName ? 'has-error' : ''}`}
                style={{ paddingRight: 12 }}
                {...register('fullName')}
              />
            </div>
          </FormField>

          <FormField label="Email address" htmlFor="email" error={errors.email?.message} required>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                style={{ paddingRight: 12 }}
                {...register('email')}
              />
            </div>
          </FormField>

          <FormField label="Organization" htmlFor="organization" error={errors.organization?.message}>
            <div className="input-with-icon">
              <Building2 size={16} />
              <input
                id="organization"
                className="form-input"
                style={{ paddingRight: 12 }}
                {...register('organization')}
              />
            </div>
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              hasError={Boolean(errors.password)}
              {...register('password')}
            />
          </FormField>

          <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              hasError={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
          </FormField>

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting} style={{ marginTop: 8 }}>
            {isSubmitting && <span className="spinner" />}
            Create account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to={ROUTES.login}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
