import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';

interface Props {
  permission?: string;
  /**
   * FE-04/P-FE04-3: neke stranice spajaju više modula (npr. „Naslijeđe” =
   * Hall of Fame + Muzej, „Komunikacije” = kontakt poruke + newsletter), pa im je
   * dovoljna BILO koja od dozvola. Do sada su te rute bile samo iza
   * `ProtectedRoute` — svaki prijavljeni korisnik je otvarao stranicu i vidio
   * prazne tabove umjesto preusmjerenja.
   */
  anyOf?: string[];
}

export function PermissionRoute({ permission, anyOf }: Props) {
  const { user } = useAuth();
  const perms = user?.permissions;
  const allowed = anyOf?.length
    ? anyOf.some((key) => hasPermission(perms, key))
    : permission !== undefined && hasPermission(perms, permission);
  if (!allowed) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
