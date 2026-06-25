import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationRealtime,
  useNotifications,
} from '../../hooks/use-notifications';
import { formatDateTime } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogHeader } from '../ui/dialog';

export function NotificationBell({ admin = false }: { admin?: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  useNotificationRealtime();
  const { data } = useNotifications({ unreadOnly: true });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = data?.data ?? [];
  const count = data?.meta.total ?? unread.length;

  const listPath = admin ? '/admin/notifications' : '/notifikacije';

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        aria-label={t('notifications.title')}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen} className="max-w-sm">
        <DialogHeader onClose={() => setOpen(false)}>{t('notifications.title')}</DialogHeader>
        <DialogBody>
          <div className="mb-3 flex justify-between">
            <Link to={listPath} className="text-sm text-accent hover:underline" onClick={() => setOpen(false)}>
              {t('notifications.viewAll')}
            </Link>
            {count > 0 && (
              <button
                type="button"
                className="text-sm text-text-muted hover:text-primary"
                onClick={() => void markAll.mutateAsync()}
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {unread.length === 0 ? (
              <li className="text-sm text-text-muted">{t('notifications.empty')}</li>
            ) : (
              unread.slice(0, 10).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-surface"
                    onClick={() => void markRead.mutateAsync(n.id)}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-text-muted">{n.body}</p>
                    <p className="mt-1 text-xs text-text-muted">{formatDateTime(n.createdAt)}</p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </DialogBody>
      </Dialog>
    </>
  );
}
