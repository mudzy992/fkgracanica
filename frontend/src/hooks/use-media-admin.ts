import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface MediaAsset {
  id: string;
  filename: string;
  originalPath: string;
  thumbPath?: string | null;
  mediumPath?: string | null;
  mimeType: string;
  size: number;
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return (await api.post<MediaAsset>('/media/upload', form, {
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
