import { Link } from 'react-router-dom';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { useDashboardKpis } from '../../../hooks';
import { Seo } from '../../../components/seo/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { adminLinkClass } from '../../../lib/admin-styles';
import {
  HEALTH_KPI_KEYS,
  KPI_ICONS,
  KPI_LABELS,
  KPI_ROUTES,
  QUEUE_KPI_KEYS,
} from '../dashboard-kpi-config';
import { PlatformStatusTeaser } from '../platform-status/PlatformStatusTeaser';
import { HomeQuickActions } from './HomeQuickActions';
import type { HomeAction } from './HomeQuickActions';
import type { DashboardKpis } from '../../../types';

function KpiRow({ data, keys }: { data: DashboardKpis; keys: readonly string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {keys.map((key) => {
        const Icon = KPI_ICONS[key];
        const href = KPI_ROUTES[key];
        const value = data[key as keyof DashboardKpis];
        const inner = (
          <Card className="h-full border-[var(--border-subtle)] bg-surface/50 transition-colors hover:border-primary/25 hover:bg-surface/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">
                {KPI_LABELS[key] ?? key}
              </CardTitle>
              {Icon ? <Icon className="h-4 w-4 text-primary-light/70" aria-hidden /> : null}
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums text-primary-light">{value}</p>
              {href ? <p className={`mt-3 text-xs ${adminLinkClass}`}>Otvori →</p> : null}
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
  );
}

export function AdminHome() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboardKpis();
  const actions: HomeAction[] = [
    { to: '/admin/cms', label: 'CMS', variant: 'default' },
    { to: '/admin/users', label: 'Korisnici' },
    { to: '/admin/settings', label: 'Postavke' },
    { to: '/admin/live/pending', label: 'Live odobrenje' },
  ];
  if (hasPermission(user?.permissions, 'finance.read')) {
    actions.push({ to: '/admin/finance', label: 'Finansije' });
  }

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
      <h1 className="mb-2 text-2xl font-bold text-text">Kontrolna tabla</h1>
      <p className="mb-6 text-sm text-text-muted">Šta čeka akciju, pa zdravlje kluba.</p>
      {isLoading || !data ? (
        <p className="text-sm text-text-muted">Učitavanje…</p>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-semibold text-text-muted">Čeka akciju</h2>
          <KpiRow data={data} keys={QUEUE_KPI_KEYS} />
          <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">Zdravlje kluba</h2>
          <KpiRow data={data} keys={HEALTH_KPI_KEYS} />
          <HomeQuickActions items={actions} />
        </>
      )}
    </>
  );
}
