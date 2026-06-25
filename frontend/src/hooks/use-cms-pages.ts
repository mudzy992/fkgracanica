import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { CmsMenu, CmsPage, CmsWidgetMeta } from '../cms/types';

export function useCmsWidgets() {
  return useQuery({
    queryKey: ['cms', 'widgets'],
    queryFn: async () => asArray<CmsWidgetMeta>((await api.get('/cms/widgets')).data),
  });
}

export function useCmsPages(admin = true) {
  return useQuery({
    queryKey: ['cms', 'pages', admin ? 'admin' : 'public'],
    queryFn: async () => asArray<CmsPage>((await api.get('/cms/pages', { params: admin ? { admin: '1' } : {} })).data),
  });
}

export function useCmsPage(slug: string, admin = false) {
  return useQuery({
    queryKey: ['cms', 'pages', slug, admin ? 'admin' : 'public'],
    queryFn: async () =>
      (await api.get(`/cms/pages/${slug}`, { params: admin ? { admin: '1' } : {} })).data as CmsPage,
    enabled: !!slug,
  });
}

export function useCmsMenu(key: string) {
  return useQuery({
    queryKey: ['cms', 'menus', key],
    queryFn: async () => (await api.get(`/cms/menus/${key}`)).data as CmsMenu,
  });
}

export function useCreateCmsPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { slug: string; title: string; status?: string }) =>
      (await api.post('/cms/pages', body)).data as CmsPage,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'pages'] }),
  });
}

export function useUpdateCmsPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/cms/pages/${id}`, body)).data as CmsPage,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'pages'] }),
  });
}

export function useDeleteCmsPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cms/pages/${id}`);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'pages'] }),
  });
}

export function useAddCmsSection(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { widgetType: string; config?: object }) =>
      (await api.post(`/cms/pages/${pageId}/sections`, body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['cms', 'pages'] });
    },
  });
}

export function useUpdateCmsSection(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, ...body }: { sectionId: string } & Record<string, unknown>) =>
      (await api.patch(`/cms/pages/${pageId}/sections/${sectionId}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'pages'] }),
  });
}

export function useDeleteCmsSection(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sectionId: string) => {
      await api.delete(`/cms/pages/${pageId}/sections/${sectionId}`);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'pages'] }),
  });
}

export function useReorderCmsSections(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) =>
      (await api.patch(`/cms/pages/${pageId}/sections/reorder`, { ids })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'pages'] }),
  });
}

export function useSaveCmsMenu(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<Record<string, unknown>>) =>
      (await api.put(`/cms/menus/${key}`, { items })).data as CmsMenu,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'menus'] }),
  });
}
