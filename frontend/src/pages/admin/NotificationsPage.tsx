import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/use-notifications';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { runAction } from '../../lib/action-errors';

const TYPE_ICON = { info: Info, success: CheckCircle, warning: AlertTriangle } as const;

export function NotificationsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useNotifications({ page });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = data?.data ?? [];

  return (
    <>
      <Seo title={t('notifications.title')} />
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('notifications.title')}
        isLoading={isLoading}
        actions={
          <Button variant="outline" size="sm" onClick={() => void runAction(markAll.mutateAsync())}>
            {t('notifications.markAllRead')}
          </Button>
        }
      >
        <ul className="space-y-2 p-4">
          {items.length === 0 && (
            <p className="text-center text-sm text-text-muted">
              {t('notifications.empty', 'Nema obavještenja.')}
            </p>
          )}
          {items.map((n) => {
            const Icon = TYPE_ICON[(n.type as keyof typeof TYPE_ICON) ?? 'info'] ?? Bell;
            const deepLink = n.metadata?.path;
            return (
              <li key={n.id}>
                <Card className={`p-4 ${n.isRead ? '' : 'border-accent/50 bg-surface'}`}>
                  <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                    <div>
                      {deepLink ? (
                        <Link to={deepLink} className="font-medium hover:underline">
                          {n.title}
                        </Link>
                      ) : (
                        <p className="font-medium">{n.title}</p>
                      )}
                      <p className="text-sm text-text-muted">{n.body}</p>
                      <p className="mt-1 text-xs text-text-muted">{formatDateTime(n.createdAt)}</p>
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void runAction(markRead.mutateAsync(n.id))}
                    >
                      {t('notifications.markRead')}
                    </Button>
                  )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
        {data?.meta && <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />}
      </AdminPageShell>
    </>
  );
}
