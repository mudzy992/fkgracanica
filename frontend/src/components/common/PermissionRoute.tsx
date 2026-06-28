import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';

interface Props {
  permission: string;
}

export function PermissionRoute({ permission }: Props) {
  const { user } = useAuth();
  if (!hasPermission(user?.permissions, permission)) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
