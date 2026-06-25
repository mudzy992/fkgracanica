import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { PaginatedResponse } from '../types/pagination';

export interface MediaAsset {
  id: string;
  filename: string;
  originalPath: string;
  thumbPath?: string | null;
  mediumPath?: string | null;
  mimeType: string;
  size: number;
  folderId?: string | null;
  tags?: string | null;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string | null;
  children?: MediaFolder[];
  _count?: { assets: number };
}

export function useMediaFolders() {
  return useQuery({
    queryKey: ['media', 'folders'],
    queryFn: async () => asArray<MediaFolder>((await api.get('/media/folders')).data),
  });
}

export function useMediaAssets(params: { folderId?: string; page?: number; search?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['media', 'assets', params],
    queryFn: async () =>
      (await api.get<PaginatedResponse<MediaAsset>>('/media/assets', {
        params: {
          folderId: params.folderId,
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          search: params.search || undefined,
        },
      })).data,
  });
}

export function useMediaAsset(id: string | null) {
  return useQuery({
    queryKey: ['media', 'asset', id],
    queryFn: async () => (await api.get<MediaAsset>(`/media/assets/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; parentId?: string }) =>
      (await api.post<MediaFolder>('/media/folders', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['media', 'folders'] }),
  });
}

export function useUpdateMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string }) =>
      (await api.patch<MediaFolder>(`/media/folders/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['media', 'folders'] }),
  });
}

export function useDeleteMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/media/folders/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['media', 'folders'] }),
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, folderId }: { file: File; folderId?: string }) => {
      const form = new FormData();
      form.append('file', file);
      if (folderId) form.append('folderId', folderId);
      return (await api.post<MediaAsset>('/media/upload', form, {
        headers: { 'Content-Type': undefined },
      })).data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['media', 'assets'] }),
  });
}

export function useUpdateMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; filename?: string; tags?: string; folderId?: string | null }) =>
      (await api.patch<MediaAsset>(`/media/assets/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['media', 'assets'] }),
  });
}

export function useReplaceMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.append('file', file);
      return (await api.post<MediaAsset>(`/media/assets/${id}/replace`, form, {
        headers: { 'Content-Type': undefined },
      })).data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['media', 'assets'] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/media/assets/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['media', 'assets'] }),
  });
}
