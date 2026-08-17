import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { ContentStatus, NewsItem } from '../types';

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
}

export interface NewsWriteBody {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  coverPath?: string;
  videoUrl?: string;
  galleryId?: string;
  categoryId?: string;
  seoTitle?: string;
  seoDesc?: string;
  scheduledAt?: string | null;
  tags?: string[];
  relatedMatchIds?: string[];
  relatedPlayerIds?: string[];
}

export function useNewsCategories() {
  return useQuery({
    queryKey: ['news-categories'],
    queryFn: async () => asArray<NewsCategory>((await api.get('/news-categories')).data),
  });
}

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewsWriteBody) => (await api.post<NewsItem>('/news', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: NewsWriteBody & { id: string }) =>
      (await api.patch<NewsItem>(`/news/${id}`, body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news'] });
      void qc.invalidateQueries({ queryKey: ['news', 'published'] });
    },
  });
}

export function useSubmitNewsForReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.patch<NewsItem>(`/news/${id}/submit`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useUpdateNewsStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContentStatus }) =>
      (await api.patch<NewsItem>(`/news/${id}/status`, { status })).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news'] });
      void qc.invalidateQueries({ queryKey: ['news', 'published'] });
    },
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/news/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useNewsById(id?: string) {
  return useQuery({
    queryKey: ['news', 'id', id],
    queryFn: async () => (await api.get<NewsItem>(`/news/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateNewsCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; slug?: string }) =>
      (await api.post<NewsCategory>('/news-categories', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news-categories'] }),
  });
}

export function useDeleteNewsCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/news-categories/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news-categories'] }),
  });
}
