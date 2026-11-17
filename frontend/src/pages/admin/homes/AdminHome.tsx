import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  canViewKpi,
} from '../dashboard-kpi-config';
import { PlatformStatusTeaser } from '../platform-status/PlatformStatusTeaser';
import { HomeQuickActions } from './HomeQuickActions';
import type { HomeAction } from './HomeQuickActions';
import type { DashboardKpis } from '../../../types';

const ACTION_PERMISSIONS: Record<string, string> = {
  '/admin/cms': 'cms.manage',
  '/admin/users': 'users.read',
  '/admin/settings': 'settings.read',
  '/admin/live/pending': 'live.approve',
  '/admin/finance': 'finance.read',
};

function KpiSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-live="polite">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-[118px] border-[var(--border-subtle)] bg-surface/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-3 w-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function KpiRow({
  data,
  keys,
  permissions,
}: {
  data: DashboardKpis;
  keys: readonly string[];
  permissions?: string[];
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {keys.map((key) => {
        const Icon = KPI_ICONS[key];
        const canView = canViewKpi(key, permissions, hasPermission);
        const href = canView ? KPI_ROUTES[key] : undefined;
        const raw = data[key as keyof DashboardKpis];
        const value = raw ?? '—';
        const label = t(`admin.kpi.${key}`, { defaultValue: KPI_LABELS[key] ?? key });
        const ariaLabel = `${label}: ${value}`;
        const inner = (
          <Card className="h-full border-[var(--border-subtle)] bg-surface/50 transition-colors hover:border-primary/25 hover:bg-surface/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">{label}</CardTitle>
              {Icon ? <Icon className="h-4 w-4 text-primary-light/70" aria-hidden /> : null}
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums text-primary-light" aria-label={ariaLabel}>
                {value}
              </p>
              {href ? (
                <p className={`mt-3 text-xs ${adminLinkClass}`}>{t('admin.home.open')}</p>
              ) : null}
            </CardContent>
          </Card>
        );
        return href ? (
          <Link
            key={key}
            to={href}
            aria-label={ariaLabel}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          >
            {inner}
          </Link>
        ) : (
          <div key={key} aria-label={ariaLabel}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export function AdminHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const enabledDashboard = hasPermission(user?.permissions, 'dashboard.read');
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } =
    useDashboardKpis(enabledDashboard);

  const baseActions: HomeAction[] = [
    { to: '/admin/cms', label: t('admin.cms'), variant: 'default' },
    { to: '/admin/users', label: t('admin.usersAndRoles') },
    { to: '/admin/settings', label: t('admin.settings') },
    { to: '/admin/live/pending', label: t('admin.livePending') },
  ];
  if (hasPermission(user?.permissions, 'finance.read')) {
    baseActions.push({ to: '/admin/finance', label: t('admin.finance') });
  }
  const actions = baseActions.filter((a) => {
    const req = ACTION_PERMISSIONS[a.to];
    if (!req) return true;
    return hasPermission(user?.permissions, req);
  });

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      <Seo title={t('admin.home.metaTitle')} />
      <h1 className="mb-2 text-2xl font-bold text-text">{t('admin.home.title')}</h1>
      <p className="mb-6 text-sm text-text-muted">{t('admin.home.subtitle')}</p>
      <PlatformStatusTeaser />
      {isError ? (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center gap-4 py-12"
        >
          <p className="text-text-muted">{t('admin.home.kpiError')}</p>
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? t('admin.common.loading') : t('actions.retry')}
          </Button>
        </div>
      ) : isLoading || !data ? (
        <>
          <h2 className="mb-3 text-sm font-semibold text-text-muted">{t('admin.home.queue')}</h2>
          <KpiSkeletonGrid />
        </>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-semibold text-text-muted">{t('admin.home.queue')}</h2>
          <KpiRow data={data} keys={QUEUE_KPI_KEYS} permissions={user?.permissions} />
          <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">
            {t('admin.home.health')}
          </h2>
          <KpiRow data={data} keys={HEALTH_KPI_KEYS} permissions={user?.permissions} />
          {lastUpdated ? (
            <div className="mt-6 flex items-center gap-3 text-xs text-text-muted">
              <span>
                {t('admin.home.lastUpdated', { defaultValue: 'Ažurirano u {{time}}', time: lastUpdated })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
                aria-label={t('actions.retry')}
              >
                {isFetching ? t('admin.common.loading') : t('admin.home.refresh', { defaultValue: 'Osvježi' })}
              </Button>
            </div>
          ) : null}
          <HomeQuickActions items={actions} />
        </>
      )}
    </>
  );
}
