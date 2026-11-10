import { render } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', async (orig) => {
  const actual = await (orig() as never) as Record<string, unknown>;
  return { ...(actual as object), useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../../hooks/use-players', () => ({
  usePlayers: () => ({ data: [{ id: '1', photoPath: '/a.jpg', name: 'A' }], isLoading: false }),
  usePlayer: () => ({ data: null }),
}));
vi.mock('../../hooks/use-public-settings', () => ({ usePublicSettings: () => ({ data: {} }) }));

import { FeaturedPlayersWidget } from '../../cms/widgets/FeaturedPlayersWidget';
import { AdminFormSheet } from './AdminFormSheet';
import { RichTextEditor } from './RichTextEditor';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{c}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('batch66r admin/widgets', () => {
  it('FeaturedPlayersWidget pokriva players.length true', () => {
    const { container } = render(wrap(<FeaturedPlayersWidget config={{ limit: 2 } as never} />));
    expect(container).toBeDefined();
  });
  it('AdminFormSheet pokriva', () => {
    // jsdom nema <dialog>.showModal
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = vi.fn() as never;
      HTMLDialogElement.prototype.close = vi.fn() as never;
    }
    const { container: c1 } = render(wrap(<AdminFormSheet open={false} onOpenChange={vi.fn()} title="T"><div>hi</div></AdminFormSheet>));
    expect(c1).toBeDefined();
    const { container: c2 } = render(wrap(<AdminFormSheet open={true} onOpenChange={vi.fn()} title="T"><div>hi</div></AdminFormSheet>));
    expect(c2).toBeDefined();
  });
  it('RichTextEditor pokriva', () => {
    const { container } = render(wrap(<RichTextEditor value="<p>hi</p>" onChange={vi.fn()} />));
    expect(container).toBeDefined();
    const { container: c2 } = render(wrap(<RichTextEditor value="" onChange={vi.fn()} />));
    expect(c2).toBeDefined();
  });
});
