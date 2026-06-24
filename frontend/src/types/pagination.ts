export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type?: string | null;
  isRead: boolean;
  createdAt: string;
}
