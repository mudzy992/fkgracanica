import { useState } from 'react';
import { usePrivateSettings } from '../../hooks';
import { hasPermission } from '../../lib/permissions';
import { useAuth } from '../../lib/auth';
import { formatDateTime } from '../../lib/utils';
import { useConfirm } from '../../hooks/use-confirm';
import {
  useCreateNewsletterCampaign,
  useNewsletterCampaigns,
  useSendNewsletterCampaign,
  type NewsletterCampaign,
} from '../../hooks/use-newsletter-campaigns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { AdminDataTable } from '../admin/AdminPageShell';

const STATUS: Record<NewsletterCampaign['status'], string> = {
  DRAFT: 'Nacrt',
  SENDING: 'Šalje se',
  SENT: 'Poslano',
  FAILED: 'Neuspjelo',
};

export function NewsletterCampaignPanel() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'newsletter.manage');
  const { data: settings } = usePrivateSettings();
  const blastOn = settings?.['newsletter.blastEnabled'] === 'true';
  const { data: campaigns, isLoading } = useNewsletterCampaigns();
  const create = useCreateNewsletterCampaign();
  const send = useSendNewsletterCampaign();
  const { confirm, dialog } = useConfirm();
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const onCreate = async () => {
    if (!subject.trim() || !htmlBody.trim()) return;
    await create.mutateAsync({ subject: subject.trim(), htmlBody });
    setSubject('');
    setHtmlBody('');
  };

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
      {canManage && (
        <div className="space-y-2 rounded-lg border border-[var(--border-subtle)] p-4">
          <Input placeholder="Naslov" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea
            rows={8}
            placeholder="HTML tijelo poruke"
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setPreview(htmlBody)} disabled={!htmlBody}>
              Pregled
            </Button>
            <Button size="sm" onClick={() => void onCreate()} disabled={create.isPending || !subject.trim() || !htmlBody.trim()}>
              Spremi nacrt
            </Button>
          </div>
          {preview !== null && (
            <iframe title="Pregled" sandbox="" className="h-48 w-full rounded border border-[var(--border-subtle)] bg-white" srcDoc={preview} />
          )}
        </div>
      )}
      <AdminDataTable
        rows={campaigns ?? []}
        empty={isLoading ? 'Učitavanje…' : 'Nema kampanja.'}
        columns={[
          { key: 'subject', header: 'Naslov', render: (r) => r.subject },
          {
            key: 'status',
            header: 'Status',
            render: (r) => <Badge variant={r.status === 'SENT' ? 'success' : r.status === 'FAILED' ? 'danger' : 'muted'}>{STATUS[r.status]}</Badge>,
          },
          { key: 'counts', header: 'Brojke', render: (r) => `${r.sentCount}/${r.targetCount} (fail ${r.failCount})` },
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
