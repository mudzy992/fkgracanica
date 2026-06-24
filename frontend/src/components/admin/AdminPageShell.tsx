import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface AdminListPageProps {
  title: string;
  isLoading?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageShell({ title, isLoading, actions, children }: AdminListPageProps) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {actions}
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">{children}</CardContent>
        </Card>
      )}
    </div>
  );
}

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export function AdminDataTable<T extends { id: string }>({
  rows,
  columns,
  empty = 'Nema podataka',
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
}) {
  if (!rows.length) {
    return <p className="p-6 text-center text-text-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-text-muted">
            {columns.map((col) => (
              <th key={col.key} className="p-4 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 hover:bg-surface/50">
              {columns.map((col) => (
                <td key={col.key} className="p-4">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
