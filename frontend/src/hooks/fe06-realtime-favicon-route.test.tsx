import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRealtimeConnected } from './use-realtime-connected';
import { useDynamicFavicon } from './use-dynamic-favicon';
import { filterPathsByModule, resolveAdminModuleKey, resolvePublicModuleKey } from '../lib/route-module-map';

type Handler = () => void;
const socket = vi.hoisted(() => {
  const handlers = new Map<string, Set<Handler>>();
  return {
    connected: false,
    emit: vi.fn(),
    on: vi.fn((name: string, handler: Handler) => { (handlers.get(name) ?? handlers.set(name, new Set()).get(name)!).add(handler); }),
    off: vi.fn((name: string, handler: Handler) => { handlers.get(name)?.delete(handler); }),
    fire: (name: string) => handlers.get(name)?.forEach((handler) => handler()),
    reset: () => { handlers.clear(); },
  };
});
vi.mock('../lib/realtime', () => ({ getRealtimeSocket: () => socket }));

beforeEach(() => { socket.reset(); socket.on.mockClear(); socket.off.mockClear(); socket.connected = false; });

describe('useRealtimeConnected', () => {
  it('početno stanje prati socket i mijenja se na connect/disconnect', () => {
    const { result, unmount } = renderHook(() => useRealtimeConnected());
    expect(result.current).toBe(false);
    act(() => { socket.connected = true; socket.fire('connect'); });
    expect(result.current).toBe(true);
    act(() => { socket.connected = false; socket.fire('disconnect'); });
    expect(result.current).toBe(false);
    unmount();
    expect(socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  it('preuzima već aktivnu vezu pri montiranju', () => {
    socket.connected = true;
    const { result } = renderHook(() => useRealtimeConnected());
    expect(result.current).toBe(true);
  });
});

describe('useDynamicFavicon', () => {
  beforeEach(() => {
    document.head.querySelectorAll("link[rel='icon']").forEach((el) => el.remove());
  });

  it('bez grba ne dira document.head', () => {
    renderHook(() => useDynamicFavicon(undefined));
    expect(document.head.querySelector("link[rel='icon']")).toBeNull();
  });

  it('kreira link ako ne postoji i postavlja thumb putanju', () => {
    renderHook(() => useDynamicFavicon('uploads/crest.png'));
    const link = document.head.querySelector<HTMLLinkElement>("link[rel='icon']")!;
    expect(link).not.toBeNull();
    expect(link.type).toBe('image/png');
    expect(link.href).toContain('crest');
  });

  it('ponovo koristi postojeći link i preskače nevalidnu putanju', () => {
    const existing = document.createElement('link');
    existing.rel = 'icon';
    document.head.appendChild(existing);
    const { rerender } = renderHook(({ path }: { path?: string }) => useDynamicFavicon(path), {
      initialProps: { path: 'uploads/a.png' as string | undefined },
    });
    expect(document.head.querySelectorAll("link[rel='icon']")).toHaveLength(1);
    const before = existing.href;
    rerender({ path: undefined });
    expect(existing.href).toBe(before);
  });
});

describe('route-module-map', () => {
  it.each([
    ['/vijesti', 'modules.news'],
    ['/vijesti/123', 'modules.news'],
    ['/galerija/abc', 'modules.gallery'],
    ['/p/o-nama', 'modules.cms'],
    ['/nepoznato', null],
    ['/vijesticar', null],
  ])('javna ruta %s → %s', (path, expected) => {
    expect(resolvePublicModuleKey(path)).toBe(expected);
  });

  it.each([
    ['/admin/news', 'modules.news'],
    ['/admin/news/42', 'modules.news'],
    ['/admin/museum', 'modules.museum'],
    ['/admin/nepoznato', null],
  ])('admin ruta %s → %s', (path, expected) => {
    expect(resolveAdminModuleKey(path)).toBe(expected);
  });

  it('filterPathsByModule propušta vanjske linkove i rute bez modula', () => {
    const values = { 'modules.news': 'true' };
    const isEnabled = (vals: Record<string, string> | undefined, key: string) => vals?.[key] === 'true';
    const items = [
      { to: '/vijesti' }, { to: '/galerija' }, { to: '/kontakt' },
      { to: 'https://vanjski.example/test' }, { to: '/' },
    ];
    expect(filterPathsByModule(items, values, isEnabled).map((i) => i.to)).toEqual([
      '/vijesti', 'https://vanjski.example/test', '/',
    ]);
  });
});
