import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { resolveStaffHome } from '../../lib/staff-home';
import { useDashboardKpis } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { adminLinkClass } from '../../lib/admin-styles';
import { KPI_ICONS, KPI_LABELS, KPI_ROUTES } from './dashboard-kpi-config';
import { PlatformStatusTeaser } from './platform-status/PlatformStatusTeaser';
import { CommentatorHome } from './homes/CommentatorHome';
import { ModeratorHome } from './homes/ModeratorHome';
import { WriterHome } from './homes/WriterHome';

function AdminKpiDashboard() {
  const { data, isLoading, isError, refetch } = useDashboardKpis();

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-text-muted">Nije moguće učitati KPI podatke.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Pokušaj ponovo
        </Button>
      </div>
    );
  }

  return (
    <>
      <Seo title="Dashboard" />
      <PlatformStatusTeaser />
      <AdminPageShell title="Kontrolna tabla" isLoading={isLoading}>
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {data &&
            Object.entries(data).map(([key, value]) => {
              const Icon = KPI_ICONS[key];
              const href = KPI_ROUTES[key];
              const inner = (
                <Card className="h-full border-[var(--border-subtle)] bg-surface/50 transition-colors hover:border-primary/25 hover:bg-surface/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                      {KPI_LABELS[key] ?? key}
                    </CardTitle>
                    {Icon && <Icon className="h-4 w-4 text-primary-light/70" aria-hidden />}
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tabular-nums text-primary-light">{value}</p>
                    {href && <p className={`mt-3 text-xs ${adminLinkClass}`}>Otvori modul →</p>}
                  </CardContent>
                </Card>
              );
              return href ? (
                <Link
                  key={key}
                  to={href}
                  className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
                >
                  {inner}
                </Link>
              ) : (
                <div key={key}>{inner}</div>
              );
            })}
        </div>
      </AdminPageShell>
    </>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const kind = resolveStaffHome(user?.permissions);
  if (kind === 'moderator') return <ModeratorHome />;
  if (kind === 'commentator') return <CommentatorHome />;
  if (kind === 'writer') return <WriterHome />;
  return <AdminKpiDashboard />;
}
