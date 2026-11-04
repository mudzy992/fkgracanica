import type { ContactMessage } from '../../types';
import { adminLinkClass } from '../../lib/admin-styles';
import { formatDateTime } from '../../lib/utils';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { useTranslation } from 'react-i18next';

interface ContactMessageSheetProps {
  message: ContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRead: (id: string) => void;
  isMarking?: boolean;
}

export function ContactMessageSheet({
  message,
  open,
  onOpenChange,
  onMarkRead,
  isMarking,
}: ContactMessageSheetProps) {
  const { t } = useTranslation();
  if (!message) return null;

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={message.subject ?? 'Kontakt poruka'}
    >
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-text-muted">Od</dt>
          <dd className="font-medium">
            <a href={`mailto:${message.email}`} className={adminLinkClass}>
              {message.name} &lt;{message.email}&gt;
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-text-muted">{t('admin.contactMessage.date')}</dt>
          <dd>{formatDateTime(message.createdAt)}</dd>
        </div>
        <div>
          <dt className="mb-1 text-text-muted">{t('admin.contactMessage.message')}</dt>
          <dd className="whitespace-pre-wrap rounded-lg bg-surface p-4">{message.message}</dd>
        </div>
      </dl>
      {!message.isRead && (
        <Button className="mt-6 w-full" onClick={() => onMarkRead(message.id)} disabled={isMarking}>
          Označi kao pročitano
        </Button>
      )}
    </AdminFormSheet>
  );
}
