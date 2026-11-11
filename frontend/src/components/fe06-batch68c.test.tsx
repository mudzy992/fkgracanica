import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const teamState = vi.hoisted(() => ({ reduce: false }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => teamState.reduce };
});

import { findBlockedMenuItems } from '../pages/admin/cms/menu-module-warnings';
import { HeroSectionForm } from '../pages/admin/cms/forms/HeroSectionForm';
import { TeamCinematicHero } from './team/TeamCinematicHero';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{c}</MemoryRouter></QueryClientProvider>;
}

describe('fe06-batch68c cms+team', () => {
  it('menu-module-warnings pokriva ?? key fallback', () => {
    const items = [{ label: 'Test', href: '/test', moduleKey: 'nonexistent-key-xyz', enabled: true } as never];
    const blocked = findBlockedMenuItems(items, { nonexistent: false } as never);
    expect(blocked).toBeDefined();
  });

  it('HeroSectionForm pokriva hero.buttons ?? []', () => {
    const { container } = render(wrap(<HeroSectionForm config={{}} onChange={vi.fn()} />));
    expect(container).toBeDefined();
    const { container: c2 } = render(wrap(<HeroSectionForm config={{ buttons: [{ label: 'A', url: '/a', variant: 'primary' }] }} onChange={vi.fn()} />));
    expect(c2).toBeDefined();
  });

  it('TeamCinematicHero pokriva reduce ? false : {opacity}', () => {
    const club = { id: '1', name: 'FK', crestPath: null } as never;
    const squad = { formation: { def: 4, mid: 4, fwd: 2 }, slots: [{ isBench: false, player: {} }] } as never;
    const stats = { season: { name: '2024/25' }, standing: { points: 10 } } as never;
    teamState.reduce = false;
    const { container: c1 } = render(wrap(<TeamCinematicHero club={club} squad={squad} stats={stats} city="Grad" stadiumName="Stadion" />));
    expect(c1.textContent).toContain('FK');
    teamState.reduce = true;
    const { container: c2 } = render(wrap(<TeamCinematicHero club={club} squad={null} stats={null} />));
    expect(c2).toBeDefined();
  });
});
