import { useAuth } from '../lib/auth';
import { hasPermission } from '../lib/permissions';

export function useMediaLibraryAccess() {
  const { user } = useAuth();
  const p = user?.permissions;
  const canManage = hasPermission(p, 'media.manage');
  return {
    canManage,
    canUpload: canManage || hasPermission(p, 'media.upload'),
    canRead: canManage || hasPermission(p, 'media.read'),
  };
}
