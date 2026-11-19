import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEmailLog } from '../../hooks/use-notifications';
import { formatDateTime } from '../../lib/utils';
import { AdminDataTable } from '../../components/admin/AdminPageShell';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';

export function EmailLogPanel() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useEmailLog(page);

  const rows = data?.data ?? [];
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const emptyLabel = t('admin.emailLog.noErrors', { defaultValue: 'Nema grešaka.' }) as string;

  if (isError) {
    return (
      <div role="alert" className="flex flex-col gap-3 p-4">
        <p className="text-sm text-danger">
          {t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={Boolean(isFetching)}
        >
          {isFetching
            ? (t('admin.common.loading') as string)
            : (t('admin.common.retry', { defaultValue: 'Pokušaj ponovo' }) as string)}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div aria-busy="true" className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
        <p className="sr-only">{t('admin.common.loading')}</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm font-medium">{t('admin.emailLog.noErrors')}</p>
        <p className="text-xs text-text-muted">{t('admin.emailLog.allDelivered')}</p>
      </div>
    );
  }

  return (
    <div>
      {lastUpdated ? (
        <div className="mb-3 flex items-center justify-end gap-3 px-4 pt-4 text-xs text-text-muted">
          <span>
            {t('admin.home.lastUpdated', {
              defaultValue: 'Ažurirano u {{time}}',
              time: lastUpdated,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={Boolean(isFetching)}
          >
            {isFetching
              ? (t('admin.common.loading') as string)
              : (t('admin.home.refresh', { defaultValue: 'Osvježi' }) as string)}
          </Button>
        </div>
      ) : null}
      <AdminDataTable
        rows={rows}
        empty={emptyLabel}
        columns={[
          { key: 'to', header: t('admin.emailLog.to', { defaultValue: 'Prima' }) as string, render: (r) => r.to },
          { key: 'subject', header: t('admin.emailLog.subject', { defaultValue: 'Predmet' }) as string, render: (r) => r.subject },
          {
            key: 'error',
            header: t('admin.emailLog.error', { defaultValue: 'Greška' }) as string,
            render: (r) => (
              <Badge variant="danger" className="max-w-[280px] truncate text-xs">
                {r.error}
              </Badge>
            ),
          },
          { key: 'date', header: t('admin.analyticsPanel.date') as string, render: (r) => formatDateTime(r.createdAt) },
        ]}
      />
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 p-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || Boolean(isFetching)}
            onClick={() => setPage((p) => p - 1)}
          >
            Prethodna
          </Button>
          <span className="self-center text-sm" aria-live="polite">
            {page} / {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages || Boolean(isFetching)}
            onClick={() => setPage((p) => p + 1)}
          >
            Sljedeća
          </Button>
        </div>
      )}
    </div>
  );
}
