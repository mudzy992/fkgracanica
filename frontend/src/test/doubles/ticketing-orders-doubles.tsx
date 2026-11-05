import type { ReactNode } from 'react';

/** Zajedničko stanje i dvojnici za TicketingOrdersTab testove (dva fajla). */
export const ticketingOrdersState = {
  orders: { data: [] as unknown[], isLoading: false },
  canManage: true,
  confirm: async () => true,
  confirmPayment: { mutateAsync: async () => ({}), isPending: false },
  confirmRefund: { mutateAsync: async () => ({}), isPending: false },
  sheet: {} as { order: Record<string, unknown> | null; open: boolean; canManage: boolean },
};

type Row = Record<string, unknown> & { id: string };
type Column = { key: string; header: string; render: (row: Row) => ReactNode };

export function AdminDataTableDouble({ rows, columns, empty, onRowClick }: {
  rows: Row[]; columns: Column[]; empty?: string; onRowClick?: (r: Row) => void;
}) {
  return rows.length === 0 ? <p>{empty}</p> : (
    <div>
      {rows.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`} onClick={() => onRowClick?.(row)}>
          {columns.map((column) => <span key={column.key} data-col={column.key}>{column.render(row)}</span>)}
        </div>
      ))}
    </div>
  );
}
