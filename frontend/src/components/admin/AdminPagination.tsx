import { Button } from '../ui/button';
import type { PaginationMeta } from '../../types/pagination';

interface AdminPaginationProps {
  meta: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}

export function AdminPagination({ meta, page, onPageChange, isFetching }: AdminPaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 p-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1 || Boolean(isFetching)}
        onClick={() => onPageChange(page - 1)}
      >
        Prethodna
      </Button>
      <span className="self-center text-sm text-text-muted" aria-live="polite">
        {page} / {meta.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= meta.totalPages || Boolean(isFetching)}
        onClick={() => onPageChange(page + 1)}
      >
        Sljedeća
      </Button>
    </div>
  );
}
