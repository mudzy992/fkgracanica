import { useAuth } from '../../lib/auth';
import { resolveStaffHome } from '../../lib/staff-home';
import { AdminHome } from './homes/AdminHome';
import { CommentatorHome } from './homes/CommentatorHome';
import { ModeratorHome } from './homes/ModeratorHome';
import { WriterHome } from './homes/WriterHome';

export function DashboardPage() {
  const { user } = useAuth();
  const kind = resolveStaffHome(user?.permissions);
  if (kind === 'moderator') return <ModeratorHome />;
  if (kind === 'commentator') return <CommentatorHome />;
  if (kind === 'writer') return <WriterHome />;
  return <AdminHome />;
}
