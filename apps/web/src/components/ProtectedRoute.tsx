import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type Role } from '../lib/auth';
import { FullPageSpinner } from './Spinner';

export function ProtectedRoute({ allow }: { allow?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
