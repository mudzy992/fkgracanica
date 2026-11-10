import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const fpState = vi.hoisted(() => ({ players: null as unknown }));
vi.mock('react-i18next', async (orig) => {
  const actual = await (orig() as never) as Record<string, unknown>;
  return { ...(actual as object), useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('./ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../hooks', async (orig) => {
  const actual = await (orig() as never) as Record<string, unknown>;
  return {
    ...(actual as object),
    usePublicSettings: () => ({ data: {} }),
    useOwnClub: () => ({ data: null }),
    usePlayers: () => fpState.players ?? { data: [], isLoading: false },
  };
});

import { AdminFormSheet } from './admin/AdminFormSheet';
import { FeaturedPlayersWidget } from '../cms/widgets/FeaturedPlayersWidget';

describe('batch66f admin', () => {
  it('AdminFormSheet pokriva if !open oba', async () => {
    const onOpenChange = vi.fn();
    const qc = new QueryClient();
    const wrap = (c: React.ReactNode) => <QueryClientProvider client={qc}>{c}</QueryClientProvider>;
    // open false -> true (60,0) true, open true -> false
    const { rerender, unmount } = render(wrap(<AdminFormSheet open={false} onOpenChange={onOpenChange} title="T"><div>child</div></AdminFormSheet>));
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    rerender(wrap(<AdminFormSheet open={true} onOpenChange={onOpenChange} title="T"><div>child2</div></AdminFormSheet>));
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    // also direct open true
    const { unmount: u2 } = render(wrap(<AdminFormSheet open={true} onOpenChange={vi.fn()} title="T2"><div>c2</div></AdminFormSheet>));
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    u2();
    unmount();
  });

  it('FeaturedPlayersWidget pokriva photoPath oba', () => {
    fpState.players = { data: [{ id: '1', photoPath: 'a.jpg', firstName: 'A', lastName: 'B', number: 9, position: 'FW' }], isLoading: false } as never;
    const { container, unmount } = render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <FeaturedPlayersWidget config={{ limit: 1 } as never} />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(container.innerHTML).toContain('a.jpg');
    unmount();
    fpState.players = { data: [{ id: '2', firstName: 'C', lastName: 'D', position: 'MF' }], isLoading: false } as never;
    const { container: c2 } = render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <FeaturedPlayersWidget config={{ limit: 1 } as never} />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(c2.innerHTML).not.toContain('a.jpg');
    expect(c2.innerHTML).toContain('?');
  });
});
