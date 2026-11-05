import type { ReactNode } from 'react';

/** Generički dvojnici admin ljuske za testove stranica (bez stvarne tabele). */
export type AdminRow = Record<string, unknown> & { id: string };
export type AdminColumn = { key: string; header: string; render: (row: AdminRow) => ReactNode };

export const adminShellState = {
  title: '',
  isLoading: false,
  isError: false,
  retried: 0,
  actions: null as ReactNode,
};

export function AdminPageShellDouble({ title, isLoading, isError, onRetry, actions, children }: {
  title: string; isLoading?: boolean; isError?: boolean;
  onRetry?: () => void; actions?: ReactNode; children: ReactNode;
}) {
  adminShellState.title = title;
  adminShellState.isLoading = !!isLoading;
  adminShellState.isError = !!isError;
  adminShellState.actions = actions ?? null;
  return (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {isError && (
        <div>
          <p>greška-učitavanja</p>
          <button onClick={() => { adminShellState.retried += 1; onRetry?.(); }}>pokušaj-ponovo</button>
        </div>
      )}
      {isLoading ? <p>učitavanje</p> : children}
    </div>
  );
}

export function AdminDataTableDouble({ rows, columns, empty, onRowClick }: {
  rows: AdminRow[]; columns: AdminColumn[]; empty?: string;
  onRowClick?: (row: AdminRow) => void;
}) {
  return rows.length === 0 ? <p>{empty}</p> : (
    <div>
      {rows.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`} onClick={() => onRowClick?.(row)}>
          {columns.map((column) => (
            <span key={column.key} data-col={column.key}>{column.render(row)}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
