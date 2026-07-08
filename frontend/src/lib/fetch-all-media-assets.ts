import { api } from './api';
import { asArray } from './as-array';
import type { MediaAsset } from '../hooks/use-media-admin';
import type { PaginatedResponse } from '../types/pagination';

const PAGE_LIMIT = 100;

export async function fetchAllMediaAssetsInFolder(folderId: string): Promise<MediaAsset[]> {
  const all: MediaAsset[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await api.get<PaginatedResponse<MediaAsset>>('/media/assets', {
      params: { folderId, page, limit: PAGE_LIMIT },
    });
    all.push(...asArray<MediaAsset>(res.data.data));
    totalPages = res.data.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return all;
}
