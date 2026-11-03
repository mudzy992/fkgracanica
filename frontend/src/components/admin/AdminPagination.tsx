import { Button } from '../ui/button';
import type { PaginationMeta } from '../../types/pagination';

interface AdminPaginationProps {
  meta: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({ meta, page, onPageChange }: AdminPaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 p-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prethodna
      </Button>
      <span className="self-center text-sm text-text-muted">
        {page} / {meta.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= meta.totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Sljedeća
      </Button>
    </div>
  );
}
