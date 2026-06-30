import { Navigate, Outlet } from 'react-router-dom';
import { useModuleFlags } from '../../hooks';
import { isModuleEnabled } from '../../lib/module-settings-rules';

interface Props {
  moduleKey: string;
  redirectTo?: string;
}

export function ModuleRoute({ moduleKey, redirectTo = '/' }: Props) {
  const { data: moduleFlags, isLoading } = useModuleFlags();

  if (isLoading) return null;

  if (!isModuleEnabled(moduleFlags, moduleKey)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
