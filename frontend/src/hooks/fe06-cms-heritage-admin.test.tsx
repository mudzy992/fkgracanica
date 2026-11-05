import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useCmsWidgets, useCmsPages, useCmsPage, useCmsMenu, useCreateCmsPage, useUpdateCmsPage,
  useDeleteCmsPage, useAddCmsSection, useUpdateCmsSection, useDeleteCmsSection,
  useReorderCmsSections, useSaveCmsMenu,
} from './use-cms-pages';
import {
  useCreateHallOfFame, useUpdateHallOfFame, useDeleteHallOfFame, useCreateMuseumItem,
  useUpdateMuseumItem, useDeleteMuseumItem, useCreateTimelineEvent, useUpdateTimelineEvent,
  useDeleteTimelineEvent, useReorderTimelineEvents,
} from './use-heritage-admin';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

describe('CMS stranice: čitanje', () => {
  it('widgeti i stranice razlikuju javni od admin poziva', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: [{ id: 'w1' }] });
    const widgets = renderHook(() => useCmsWidgets(), { wrapper });
    await waitFor(() => expect(widgets.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/cms/widgets');
    const publicPages = renderHook(() => useCmsPages(false), { wrapper });
    await waitFor(() => expect(publicPages.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenLastCalledWith('/cms/pages', { params: {} });
    const adminPages = renderHook(() => useCmsPages(), { wrapper });
    await waitFor(() => expect(adminPages.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenLastCalledWith('/cms/pages', { params: { admin: '1' } });
  });

  it('stranica po slugu poštuje admin zastavicu, a prazan slug se ne traži', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: { id: 'p1', slug: 'o-nama' } });
    const empty = renderHook(({ slug }: { slug: string }) => useCmsPage(slug), {
      wrapper, initialProps: { slug: '' },
    });
    expect(api.get).not.toHaveBeenCalled();
    empty.rerender({ slug: 'o-nama' });
    await waitFor(() => expect(empty.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenLastCalledWith('/cms/pages/o-nama', { params: {} });
    const admin = renderHook(() => useCmsPage('o-nama', true), { wrapper });
    await waitFor(() => expect(admin.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenLastCalledWith('/cms/pages/o-nama', { params: { admin: '1' } });
  });

  it('meni se čita po ključu', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: { key: 'main', items: [] } });
    const { result } = renderHook(() => useCmsMenu('main'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/cms/menus/main');
    expect(result.current.data).toEqual({ key: 'main', items: [] });
  });
});

const useAddCmsSectionInP1 = () => useAddCmsSection('p1');
const useUpdateCmsSectionInP1 = () => useUpdateCmsSection('p1');
const useDeleteCmsSectionInP1 = () => useDeleteCmsSection('p1');
const useReorderCmsSectionsInP1 = () => useReorderCmsSections('p1');
const useSaveCmsMenuMain = () => useSaveCmsMenu('main');
const useUpdateHallOfFameAny = () => useUpdateHallOfFame();
const useUpdateMuseumItemAny = () => useUpdateMuseumItem();
const useUpdateTimelineEventAny = () => useUpdateTimelineEvent();

describe('CMS stranice: izmjene', () => {
  it.each([
    { name: 'create page', hook: useCreateCmsPage, method: 'post', path: '/cms/pages', vars: { slug: 's', title: 'T' }, body: { slug: 's', title: 'T' }, key: ['cms', 'pages'] },
    { name: 'update page', hook: useUpdateCmsPage, method: 'patch', path: '/cms/pages/p1', vars: { id: 'p1', title: 'T2' }, body: { title: 'T2' }, key: ['cms', 'pages'] },
    { name: 'delete page', hook: useDeleteCmsPage, method: 'delete', path: '/cms/pages/p1', vars: 'p1', body: undefined, key: ['cms', 'pages'] },
    { name: 'add section', hook: useAddCmsSectionInP1, method: 'post', path: '/cms/pages/p1/sections', vars: { widgetType: 'text' }, body: { widgetType: 'text' }, key: ['cms', 'pages'] },
    { name: 'update section', hook: useUpdateCmsSectionInP1, method: 'patch', path: '/cms/pages/p1/sections/s2', vars: { sectionId: 's2', config: {} }, body: { config: {} }, key: ['cms', 'pages'] },
    { name: 'delete section', hook: useDeleteCmsSectionInP1, method: 'delete', path: '/cms/pages/p1/sections/s2', vars: 's2', body: undefined, key: ['cms', 'pages'] },
    { name: 'reorder sections', hook: useReorderCmsSectionsInP1, method: 'patch', path: '/cms/pages/p1/sections/reorder', vars: ['s2', 's3'], body: { ids: ['s2', 's3'] }, key: ['cms', 'pages'] },
    { name: 'save menu', hook: useSaveCmsMenuMain, method: 'put', path: '/cms/menus/main', vars: [{ label: 'Početna' }], body: { items: [{ label: 'Početna' }] }, key: ['cms', 'menus'] },
  ])('$name šalje tačan zahtjev i invalidira $key', async ({ hook, method, path, vars, body, key }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api[method as keyof typeof api].mockResolvedValue({ data: { id: 'response' } });
    const { result } = renderHook(() => hook() as never, { wrapper });
    await act(async () => { await (result.current as never as { mutateAsync: (v: unknown) => Promise<unknown> }).mutateAsync(vars); });
    if (body === undefined) expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path);
    else expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path, body);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: key });
  });
});

describe('naslijeđe: izmjene', () => {
  it.each([
    { name: 'hall create', hook: useCreateHallOfFame, method: 'post', path: '/hall-of-fame', body: { name: 'A' }, key: 'hall-of-fame' },
    { name: 'hall update', hook: useUpdateHallOfFameAny, method: 'patch', path: '/hall-of-fame/h1', body: { name: 'B' }, key: 'hall-of-fame', vars: { id: 'h1', name: 'B' } },
    { name: 'hall delete', hook: useDeleteHallOfFame, method: 'delete', path: '/hall-of-fame/h1', body: undefined, key: 'hall-of-fame', vars: 'h1' },
    { name: 'museum create', hook: useCreateMuseumItem, method: 'post', path: '/museum', body: { name: 'M' }, key: 'museum' },
    { name: 'museum update', hook: useUpdateMuseumItemAny, method: 'patch', path: '/museum/m1', body: { name: 'M2' }, key: 'museum', vars: { id: 'm1', name: 'M2' } },
    { name: 'museum delete', hook: useDeleteMuseumItem, method: 'delete', path: '/museum/m1', body: undefined, key: 'museum', vars: 'm1' },
    { name: 'timeline create', hook: useCreateTimelineEvent, method: 'post', path: '/club-timeline', body: { year: 1999 }, key: 'club-timeline' },
    { name: 'timeline update', hook: useUpdateTimelineEventAny, method: 'patch', path: '/club-timeline/e1', body: { year: 2000 }, key: 'club-timeline', vars: { id: 'e1', year: 2000 } },
    { name: 'timeline delete', hook: useDeleteTimelineEvent, method: 'delete', path: '/club-timeline/e1', body: undefined, key: 'club-timeline', vars: 'e1' },
    { name: 'timeline reorder', hook: useReorderTimelineEvents, method: 'post', path: '/club-timeline/reorder', body: { ids: ['e2'] }, key: 'club-timeline', vars: ['e2'] },
  ])('$name šalje tačan zahtjev i invalidira $key', async ({ hook, method, path, body, key, vars }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api[method as keyof typeof api].mockResolvedValue({ data: { id: 'response' } });
    const { result } = renderHook(() => hook() as never, { wrapper });
    const payload = vars ?? body;
    await act(async () => { await (result.current as never as { mutateAsync: (v: unknown) => Promise<unknown> }).mutateAsync(payload); });
    if (body === undefined) expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path);
    else expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path, body);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: [key] });
  });
});
