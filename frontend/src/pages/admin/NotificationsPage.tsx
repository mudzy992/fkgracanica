import { useTranslation } from 'react-i18next';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/use-notifications';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminPageShell } from '../../components/admin/AdminPageShell';

export function NotificationsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = data?.data ?? [];

  return (
    <>
      <Seo title={t('notifications.title')} />
      <AdminPageShell
        title={t('notifications.title')}
        isLoading={isLoading}
        actions={
          <Button variant="outline" size="sm" onClick={() => void markAll.mutateAsync()}>
            {t('notifications.markAllRead')}
          </Button>
        }
      >
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border p-4 ${n.isRead ? 'border-slate-200' : 'border-accent bg-surface'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-text-muted">{n.body}</p>
                  <p className="mt-1 text-xs text-text-muted">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <Button size="sm" variant="ghost" onClick={() => void markRead.mutateAsync(n.id)}>
                    {t('notifications.markRead')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </AdminPageShell>
    </>
  );
}
