import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useNewsCategories, useNewsById, useCreateNews, useUpdateNews, useSubmitNewsForReview,
  useUpdateNewsStatus, useDeleteNews, useCreateNewsCategory, useDeleteNewsCategory,
} from './use-news-admin';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

describe('novosti: admin query i mutacije', () => {
  it('normalizuje kategorije i učitava detalj tek kada postoji ID', async () => {
    const { qc, wrapper } = setup();
    api.get.mockImplementation(async (path: string) => ({ data: path === '/news-categories'
      ? { data: { items: [{ id: 'c1', name: 'Klub' }] } } : { id: 'n1', title: 'Naslov' } }));
    const view = renderHook(({ id }: { id?: string }) => ({ categories: useNewsCategories(), news: useNewsById(id) }), {
      wrapper, initialProps: { id: undefined as string | undefined },
    });
    await waitFor(() => expect(view.result.current.categories.isSuccess).toBe(true));
    expect(view.result.current.categories.data).toEqual([{ id: 'c1', name: 'Klub' }]);
    expect(api.get).toHaveBeenCalledTimes(1);
    view.rerender({ id: 'n1' });
    await waitFor(() => expect(view.result.current.news.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/news/n1');
    expect(qc.getQueryData(['news', 'id', 'n1'])).toEqual({ id: 'n1', title: 'Naslov' });
  });

  it.each([
    { hook: useCreateNews, method: 'post', path: '/news', vars: { title: 'Naslov', content: '<p>Tekst</p>' }, body: { title: 'Naslov', content: '<p>Tekst</p>' }, keys: [['news']] },
    { hook: useSubmitNewsForReview, method: 'patch', path: '/news/n1/submit', vars: 'n1', keys: [['news']] },
    { hook: useUpdateNewsStatus, method: 'patch', path: '/news/n1/status', vars: { id: 'n1', status: 'PUBLISHED' }, body: { status: 'PUBLISHED' }, keys: [['news'], ['news', 'published']] },
    { hook: useDeleteNews, method: 'delete', path: '/news/n1', vars: 'n1', keys: [['news']] },
    { hook: useCreateNewsCategory, method: 'post', path: '/news-categories', vars: { name: 'Klub', slug: 'klub' }, body: { name: 'Klub', slug: 'klub' }, keys: [['news-categories']] },
    { hook: useDeleteNewsCategory, method: 'delete', path: '/news-categories/c1', vars: 'c1', keys: [['news-categories']] },
  ])('$method $path invalidira na uspjeh, a odbijanje ostavlja cache netaknut', async ({ hook, method, path, vars, body, keys }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const request = api[method as keyof typeof api];
    request.mockResolvedValueOnce({ data: { id: 'result' } }).mockRejectedValueOnce(new Error('403'));
    const { result } = renderHook(() => hook(), { wrapper });
    await act(async () => { expect(await result.current.mutateAsync(vars as never)).toEqual({ id: 'result' }); });
    if (body === undefined) expect(request).toHaveBeenCalledWith(path);
    else expect(request).toHaveBeenCalledWith(path, body);
    expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual(keys);
    invalidate.mockClear();
    await act(async () => { await expect(result.current.mutateAsync(vars as never)).rejects.toThrow('403'); });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('izmjena sadržaja ne dodaje legacy video polje, a ručno uklanjanje šalje null', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.patch.mockResolvedValue({ data: { id: 'n1' } });
    const { result } = renderHook(() => useUpdateNews(), { wrapper });
    const content = '<p>Susjedni tekst</p><div data-youtube-video><iframe src="legacy-invalid"></iframe></div>';
    await act(async () => { await result.current.mutateAsync({ id: 'n1', title: 'Novi naslov', content }); });
    expect(api.patch).toHaveBeenNthCalledWith(1, '/news/n1', { title: 'Novi naslov', content });
    await act(async () => { await result.current.mutateAsync({ id: 'n1', title: 'Naslov', content, videoUrl: null }); });
    expect(api.patch).toHaveBeenNthCalledWith(2, '/news/n1', { title: 'Naslov', content, videoUrl: null });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['news'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['news', 'published'] });
    invalidate.mockClear();
    api.patch.mockRejectedValueOnce(new Error('422'));
    await act(async () => { await expect(result.current.mutateAsync({ id: 'n1', title: 'Naslov', content, videoUrl: 'invalid' })).rejects.toThrow('422'); });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
