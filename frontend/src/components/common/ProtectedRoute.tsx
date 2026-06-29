import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { hasStaffAccess } from '../../lib/staff-access';
import { Skeleton } from '../ui/skeleton';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/prijava" state={{ from: location }} replace />;
  }

  if (!hasStaffAccess(user?.permissions)) {
    return <Navigate to="/clanstvo" replace />;
  }

  return <Outlet />;
}
