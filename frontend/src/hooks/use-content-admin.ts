import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { GalleryItem } from '../types';

export function useGalleryAdminList() {
  return useQuery({
    queryKey: ['gallery', 'admin'],
    queryFn: async () => asArray<GalleryItem>((await api.get('/gallery')).data),
  });
}

export function useGalleryDetail(id?: string) {
  return useQuery({
    queryKey: ['gallery', id],
    queryFn: async () => (await api.get<GalleryItem>(`/gallery/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; description?: string }) =>
      (await api.post<GalleryItem>('/gallery', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useUpdateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; title?: string; description?: string }) =>
      (await api.patch(`/gallery/${id}`, body)).data,
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

export function useDeleteGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/gallery/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useAddGalleryPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      galleryId,
      path,
      caption,
    }: {
      galleryId: string;
      path: string;
      caption?: string;
    }) => (await api.post(`/gallery/${galleryId}/photos`, { path, caption })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useAddGalleryPhotos() {
  const qc = useQueryClient();
  return useMutation({
    // Nikada automatski ne ponavljati pojedinačni POST s neizvjesnim ishodom.
    retry: false,
    networkMode: 'always',
    mutationFn: async ({ galleryId, paths }: { galleryId: string; paths: string[] }) => {
      for (const path of paths) {
        await api.post(`/gallery/${galleryId}/photos`, { path }, { timeout: 30_000 });
      }
    },
    // Djelimični uspjeh također mijenja server; detalj potvrđuje zasebni GET.
    onSettled: () => void qc.invalidateQueries({ queryKey: ['gallery'], refetchType: 'none' }),
  });
}

export function useRemoveGalleryPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ galleryId, photoId }: { galleryId: string; photoId: string }) =>
      (await api.delete(`/gallery/${galleryId}/photos/${photoId}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useReorderGalleryPhotos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ galleryId, photoIds }: { galleryId: string; photoIds: string[] }) =>
      (await api.post(`/gallery/${galleryId}/photos/reorder`, { photoIds })).data,
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
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      tier?: string;
      url?: string;
      logoPath?: string;
    }) => (await api.patch(`/sponsors/${id}`, body)).data,
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

export function useReorderSponsors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => (await api.post('/sponsors/reorder', { ids })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['sponsors'] }),
  });
}

export function useCreateTrophy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      year: number;
      competition?: string;
      description?: string;
      imagePath?: string | null;
      featured?: boolean;
    }) => (await api.post('/trophies', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['trophies'] }),
  });
}

export function useUpdateTrophy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      year?: number;
      competition?: string;
      description?: string;
      imagePath?: string | null;
      featured?: boolean;
    }) => (await api.patch(`/trophies/${id}`, body)).data,
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
