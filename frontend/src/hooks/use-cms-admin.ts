import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CmsBlock } from '../types';

export function useUpdateCmsBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; title?: string; content?: Record<string, unknown> }) =>
      (await api.patch(`/cms/blocks/${id}`, body)).data as CmsBlock,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'blocks'] }),
  });
}

export function useCreateCmsBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { key: string; title: string; content: Record<string, unknown>; page?: string }) =>
      (await api.post('/cms/blocks', body)).data as CmsBlock,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['cms', 'blocks'] }),
  });
}
