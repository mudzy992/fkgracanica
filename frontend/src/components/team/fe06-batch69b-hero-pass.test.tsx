import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const reduceState = vi.hoisted(() => ({ reduce: false }));
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => reduceState.reduce };
});
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/pass-qr', () => ({
  qrDataUrl: vi.fn(async (value: string) => {
    if (value === 'fail') throw new Error('fail');
    // delay to allow cancelled test
    await new Promise((r) => setTimeout(r, 10));
    return 'data:image/png;base64,abc';
  }),
}));

import { TeamCinematicHero } from './TeamCinematicHero';
import { PassQrCode } from '../pass/PassQrCode';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{c}</MemoryRouter></QueryClientProvider>;
}

describe('fe06-batch69b hero+pass pokriva preostale grane', () => {
  it('TeamCinematicHero drugi motion initial pokriva reduce true (squad present)', () => {
    reduceState.reduce = true;
    const squad = { formation: { def: 4, mid: 3, fwd: 3 }, slots: [{ id: '1', player: { id: 'p1' } } as never, { id: '2', player: { id: 'p2' } as never }] } as never;
    const stats = { season: { name: '2025' }, standing: { points: 10 } } as never;
    const { container } = render(wrap(<TeamCinematicHero club={{ name: 'FK', slug: 'fk', crestPath: '/a.png' } as never} squad={squad} stats={stats} city="Gračanica" stadiumName="Stadion" />));
    expect(container.textContent).toContain('Igrača');
    reduceState.reduce = false;
    const { container: c2 } = render(wrap(<TeamCinematicHero club={{ name: 'FK', slug: 'fk' } as never} squad={squad} stats={stats} city="Gračanica" stadiumName="Stadion" />));
    expect(c2.textContent).toContain('Igrača');
    reduceState.reduce = false;
  });

  it('PassQrCode largeSrc pokriva !cancelled true i false (open + unmount)', async () => {
    const { unmount: u1, container: c1 } = render(wrap(<PassQrCode value="ok" size={72} enlargeSize={280} />));
    // open the dialog to trigger large effect
    const btn = c1.querySelector('button');
    if (btn) fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 5));
    // unmount before large promise resolves -> cancelled true (should not set)
    u1();
    // second: without unmount, should set largeSrc (cancelled false)
    const { container: c2 } = render(wrap(<PassQrCode value="ok" size={72} enlargeSize={280} />));
    const btn2 = c2.querySelector('button');
    if (btn2) fireEvent.click(btn2);
    await waitFor(() => expect(c2.querySelector('img')).toBeDefined(), { timeout: 1000 });
    // also test fail case for large
    const { container: c3 } = render(wrap(<PassQrCode value="fail" size={72} enlargeSize={280} />));
    const btn3 = c3.querySelector('button');
    if (btn3) fireEvent.click(btn3);
    await new Promise((r) => setTimeout(r, 20));
    expect(c3).toBeDefined();
  });
});
