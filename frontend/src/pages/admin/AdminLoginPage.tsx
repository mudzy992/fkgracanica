import { Navigate, useLocation } from 'react-router-dom';

/** Legacy URL — jedinstvena prijava na /prijava */
export function AdminLoginPage() {
  const location = useLocation();
  return <Navigate to="/prijava" replace state={location.state} />;
}
