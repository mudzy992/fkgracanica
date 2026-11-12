import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { DataError } from '../common/DataError';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface AdminListPageProps {
  title: string;
  isLoading?: boolean;
  /**
   * FE-04/P-FE04-1: admin tabele su imale samo `isLoading` — pad API-ja je izgledao
   * kao prazna tabela („Nema podataka”), pa je administrator mislio da nema
   * zapisa umjesto da vidi grešku i dugme za ponovni pokušaj.
   */
  isError?: boolean;
  onRetry?: () => void;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageShell({
  title,
  isLoading,
  isError,
  onRetry,
  actions,
  children,
}: AdminListPageProps) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {actions}
      </div>
      {isError ? (
        <Card>
          <CardContent className="p-0">
            <DataError onRetry={onRetry} />
          </CardContent>
        </Card>
      ) : isLoading ? (
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
  onRowClick,
  rowClassName,
  cellClassName = 'p-4',
  headerCellClassName = 'p-4',
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  cellClassName?: string;
  headerCellClassName?: string;
}) {
  if (!rows.length) {
    return <p className="p-6 text-center text-text-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-left text-text-muted hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={`${headerCellClassName} font-medium`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={`${onRowClick ? 'cursor-pointer' : ''}${rowClassName?.(row) ? ` ${rowClassName(row)}` : ''}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={cellClassName}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
