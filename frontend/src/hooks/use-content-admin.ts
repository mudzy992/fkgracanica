import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useCreateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; description?: string }) =>
      (await api.post('/gallery', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useUpdateGalleryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      (await api.patch(`/gallery/${id}/status`, { status })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useCreateSponsor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; tier: string; url?: string; logoPath?: string }) =>
      (await api.post('/sponsors', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['sponsors'] }),
  });
}

export function useUpdateSponsor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string; tier?: string; url?: string }) =>
      (await api.patch(`/sponsors/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['sponsors'] }),
  });
}

export function useDeleteSponsor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/sponsors/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['sponsors'] }),
  });
}

export function useCreateTrophy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; year: number; competition?: string; description?: string }) =>
      (await api.post('/trophies', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['trophies'] }),
  });
}

export function useDeleteTrophy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/trophies/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['trophies'] }),
  });
}
