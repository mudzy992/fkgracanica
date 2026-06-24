import type { PaginatedResponse, PaginationMeta } from '../types/paginated-response.type';
import type { PaginatedQueryDto } from '../dto/paginated-query.dto';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort?: string;
  order: 'asc' | 'desc';
  search?: string;
}

export function parsePagination(query: PaginatedQueryDto): PaginationParams {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sort: query.sort,
    order: query.order ?? 'desc',
    search: query.search?.trim() || undefined,
  };
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function paginate<T>(
  params: PaginationParams,
  fetch: (skip: number, take: number) => Promise<T[]>,
  count: () => Promise<number>,
): Promise<PaginatedResponse<T>> {
  const [data, total] = await Promise.all([
    fetch(params.skip, params.limit),
    count(),
  ]);
  return { data, meta: buildMeta(total, params.page, params.limit) };
}
