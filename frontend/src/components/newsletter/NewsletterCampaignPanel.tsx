import { usePrivateSettings } from '../../hooks';
import { hasPermission } from '../../lib/permissions';
import { useAuth } from '../../lib/auth';
import { formatDateTime } from '../../lib/utils';
import { useConfirm } from '../../hooks/use-confirm';
import {
  useNewsletterCampaigns,
  useNewsletterCampaignRealtime,
  useSendNewsletterCampaign,
  type NewsletterCampaign,
} from '../../hooks/use-newsletter-campaigns';
import { NewsletterCampaignComposer } from './NewsletterCampaignComposer';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AdminDataTable } from '../admin/AdminPageShell';

const STATUS: Record<NewsletterCampaign['status'], string> = {
  DRAFT: 'Nacrt',
  SENDING: 'Šalje se',
  SENT: 'Poslano',
  FAILED: 'Neuspjelo',
};

function campaignCounts(row: NewsletterCampaign) {
  const pending = Math.max(0, row.targetCount - row.sentCount - row.failCount);
  if (row.status === 'DRAFT') return '—';
  return `poslano ${row.sentCount}/${row.targetCount} · čeka ${pending} · fail ${row.failCount}`;
}

export function NewsletterCampaignPanel() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'newsletter.manage');
  const { data: settings } = usePrivateSettings();
  const blastOn = settings?.['newsletter.blastEnabled'] === 'true';
  const { data: campaigns, isLoading } = useNewsletterCampaigns();
  useNewsletterCampaignRealtime();
  const send = useSendNewsletterCampaign();
  const { confirm, dialog } = useConfirm();

  const onSend = async (row: NewsletterCampaign) => {
    const ok = await confirm({
      title: 'Poslati kampanju svim aktivnim pretplatnicima?',
      description: row.subject,
      confirmLabel: 'Pošalji',
    });
    if (ok) void send.mutateAsync(row.id);
  };

  return (
    <div className="space-y-4 p-4">
      {dialog}
      {!blastOn && (
        <p className="text-sm text-text-muted">
          Slanje je isključeno. Uključi <strong>newsletter.blastEnabled</strong> u SMTP postavkama.
        </p>
      )}
      {canManage && <NewsletterCampaignComposer />}
      <AdminDataTable
        rows={campaigns ?? []}
        empty={isLoading ? 'Učitavanje…' : 'Nema kampanja.'}
        columns={[
          { key: 'subject', header: 'Naslov', render: (r) => r.subject },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={r.status === 'SENT' ? 'success' : r.status === 'FAILED' ? 'danger' : 'muted'}>
                {STATUS[r.status]}
              </Badge>
            ),
          },
          {
            key: 'counts',
            header: 'Brojke',
            render: (r) => (
              <div className="min-w-[160px]">
                <p className="text-xs">{campaignCounts(r)}</p>
                {r.status === 'SENDING' && r.targetCount > 0 && (
                  <div className="mt-1 h-1.5 overflow-hidden rounded bg-[var(--border-subtle)]">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, ((r.sentCount + r.failCount) / r.targetCount) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ),
          },
          { key: 'date', header: 'Kreirano', render: (r) => formatDateTime(r.createdAt) },
          {
            key: 'actions',
            header: 'Akcije',
            render: (r) =>
              canManage && r.status === 'DRAFT' ? (
                <Button size="sm" disabled={!blastOn || send.isPending} onClick={() => void onSend(r)}>
                  Pošalji
                </Button>
              ) : null,
          },
        ]}
      />
    </div>
  );
}
