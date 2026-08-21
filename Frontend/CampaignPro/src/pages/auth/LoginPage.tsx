import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { FormField } from '../../components/forms/FormField';
import { getErrorMessage } from '../../utils/errorMessages';
import { ROUTES } from '../../constants/routes';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? ROUTES.dashboard;

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);
    try {
      await login(values);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
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
        <h1 className="auth-title">Sign in to your account</h1>
        <p className="auth-subtitle">Manage your email campaigns in one place.</p>

        {apiError && <div className="auth-alert">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

          <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              hasError={Boolean(errors.password)}
              {...register('password')}
            />
          </FormField>

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting} style={{ marginTop: 8 }}>
            {isSubmitting && <span className="spinner" />}
            Sign in
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to={ROUTES.register}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
