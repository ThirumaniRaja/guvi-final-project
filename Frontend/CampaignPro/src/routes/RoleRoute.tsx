import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from '../components/loaders/PageSpinner';
import { ROUTES } from '../constants/routes';
import type { UserRole } from '../types/auth';

export function RoleRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
