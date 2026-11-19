import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { resolveStaffHome } from '../../lib/staff-home';
import { Seo } from '../../components/seo/Seo';
import { AdminHome } from './homes/AdminHome';
import { CommentatorHome } from './homes/CommentatorHome';
import { ModeratorHome } from './homes/ModeratorHome';
import { WriterHome } from './homes/WriterHome';

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const kind = resolveStaffHome(user?.permissions);
  const seo = <Seo title={t('admin.dashboard', { defaultValue: 'Kontrolna tabla' })} />;
  if (kind === 'moderator') return <>{seo}<ModeratorHome /></>;
  if (kind === 'commentator') return <>{seo}<CommentatorHome /></>;
  if (kind === 'writer') return <>{seo}<WriterHome /></>;
  if (kind === 'admin') return <>{seo}<AdminHome /></>;
  // admin je fallback, hasStaffAccess garantuje staff
  return <>{seo}<AdminHome /></>;
}
