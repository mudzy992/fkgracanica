import { useState } from 'react';
import { useIssueSeasonPass, useSeasonPassAdminList } from '../../../hooks/use-ticketing-admin';
import { ticketStatusLabel } from '../../../lib/ticketing-status';
import { formatDateTime } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { AdminDataTable } from '../../../components/admin/AdminPageShell';
import { useTranslation } from 'react-i18next';

export function TicketingSeasonTab() {
  const { t } = useTranslation();
  const { data, isLoading } = useSeasonPassAdminList();
  const issue = useIssueSeasonPass();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onIssue = async () => {
    setError(null);
    try {
      await issue.mutateAsync(email.trim());
      setEmail('');
    } catch {
      setError('Izdavanje nije uspjelo. Provjerite email i kapacitet.');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-background p-4">
        <h2 className="text-sm font-semibold">{t('admin.seasonTicket.issueTitle')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            className="min-w-[220px] flex-1"
            placeholder={t('admin.seasonTicket.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button disabled={issue.isPending || !email.trim()} onClick={() => void onIssue()}>
            {issue.isPending ? 'Izdavanje...' : 'Izdaj'}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>
      {isLoading ? (
        <p className="text-sm text-text-muted">{t('admin.common.loading')}</p>
      ) : (
        <AdminDataTable
          rows={data ?? []}
          empty="Nema sezonskih karata."
          columns={[
            { key: 'user', header: 'Korisnik', render: (r) => r.user.email },
            { key: 'season', header: 'Sezona', render: (r) => r.season.name },
            { key: 'status', header: 'Status', render: (r) => ticketStatusLabel(r.status) },
            { key: 'price', header: 'Cijena', render: (r) => `${r.price} KM` },
            { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.createdAt) },
          ]}
        />
      )}
    </div>
  );
}
