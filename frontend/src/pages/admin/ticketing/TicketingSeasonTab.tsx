import { useState } from 'react';
import { useIssueSeasonPass, useSeasonPassAdminList } from '../../../hooks/use-ticketing-admin';
import { ticketStatusLabel } from '../../../lib/ticketing-status';
import { formatDateTime } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { AdminDataTable } from '../../../components/admin/AdminPageShell';
import { useTranslation } from 'react-i18next';
import { Card } from "../../../components/ui/card";

type SeasonPassRow = {
  id: string;
  status: string;
  label: string;
  price: string;
  createdAt: string;
  user: { email: string; firstName: string | null; lastName: string | null };
  season: { name: string };
};

export function TicketingSeasonTab() {
  const { t } = useTranslation();
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useSeasonPassAdminList();
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

  if (isLoading) {
    return (
      <div aria-busy="true" className="animate-pulse space-y-3 p-4">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <p className="sr-only">{t('admin.common.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col gap-3 p-4">
        <p className="text-sm text-danger">{t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}</p>
        <Button onClick={() => refetch()} disabled={Boolean(isFetching)} size="sm" variant="outline">
          {isFetching ? t('admin.common.loading') : 'Pokušaj ponovo'}
        </Button>
      </div>
    );
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-4 p-4">
      {lastUpdated ? (
        <div className="flex items-center justify-end gap-3 text-xs text-text-muted">
          <span>{t('admin.home.lastUpdated', { defaultValue: 'Ažurirano u {{time}}', time: lastUpdated })}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={Boolean(isFetching)}>
            {isFetching ? t('admin.common.loading') : 'Osvježi'}
          </Button>
        </div>
      ) : null}
      <Card className="rounded-xl border border-[var(--border-subtle)] bg-background p-4">
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
      </Card>
      <AdminDataTable<SeasonPassRow>
        rows={(data ?? []) as SeasonPassRow[]}
        empty="Nema sezonskih karata."
        columns={[
          { key: 'user', header: 'Korisnik', render: (r: SeasonPassRow) => r.user.email },
          { key: 'season', header: 'Sezona', render: (r: SeasonPassRow) => r.season.name },
          { key: 'status', header: 'Status', render: (r: SeasonPassRow) => ticketStatusLabel(r.status) },
          { key: 'price', header: 'Cijena', render: (r: SeasonPassRow) => `${r.price} KM` },
          { key: 'date', header: 'Datum', render: (r: SeasonPassRow) => formatDateTime(r.createdAt) },
        ]}
      />
    </div>
  );
}
