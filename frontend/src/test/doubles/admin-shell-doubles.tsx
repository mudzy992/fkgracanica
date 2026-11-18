import type { ReactNode } from 'react';

/** Generički dvojnici admin ljuske za testove stranica (bez stvarne tabele). */
export type AdminRow = Record<string, unknown> & { id: string };
export type AdminColumn = { key: string; header: string; render: (row: AdminRow) => ReactNode };

export const adminShellState = {
  title: '',
  isLoading: false,
  isError: false,
  isFetching: false,
  retried: 0,
  refreshed: 0,
  dataUpdatedAt: 0 as number | undefined,
  actions: null as ReactNode,
};

export function AdminPageShellDouble({
  title,
  isLoading,
  isError,
  isFetching,
  onRetry,
  actions,
  children,
  dataUpdatedAt,
  onRefresh,
}: {
  title: string;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  onRetry?: () => void;
  actions?: ReactNode;
  children: ReactNode;
  dataUpdatedAt?: number;
  onRefresh?: () => void;
}) {
  adminShellState.title = title;
  adminShellState.isLoading = !!isLoading;
  adminShellState.isError = !!isError;
  adminShellState.isFetching = !!isFetching;
  adminShellState.dataUpdatedAt = dataUpdatedAt;
  adminShellState.actions = actions ?? null;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  return (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {lastUpdated && onRefresh ? (
        <div>
          <span>Ažurirano u {lastUpdated}</span>
          <button disabled={Boolean(isFetching)} onClick={() => { adminShellState.refreshed += 1; onRefresh?.(); }}>
            {isFetching ? 'Učitavanje...' : 'Osvježi'}
          </button>
        </div>
      ) : null}
      {isError && (
        <div role="alert">
          <p>greška-učitavanja</p>
          <button disabled={Boolean(isFetching)} onClick={() => { adminShellState.retried += 1; onRetry?.(); }}>
            pokušaj-ponovo
          </button>
        </div>
      )}
      {isLoading ? <p aria-busy="true">učitavanje</p> : children}
    </div>
  );
}

export function AdminDataTableDouble({ rows, columns, empty, onRowClick, rowClassName }: {
  rows: AdminRow[]; columns: AdminColumn[]; empty?: string;
  onRowClick?: (row: AdminRow) => void; rowClassName?: (row: AdminRow) => string | undefined;
}) {
  return rows.length === 0 ? <p role="status">{empty}</p> : (
    <div>
      {rows.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`} className={rowClassName?.(row)}
          onClick={() => onRowClick?.(row)}>
          {columns.map((column) => (
            <span key={column.key} data-col={column.key}>{column.render(row)}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminPaginationDouble({ meta, page, onPageChange }: {
  meta: { totalPages: number }; page: number; onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <div>
      <span>stranica:{page}/{meta.totalPages}</span>
      <button onClick={() => onPageChange(page - 1)}>Prethodna</button>
      <button onClick={() => onPageChange(page + 1)}>Sljedeća</button>
    </div>
  );
}
