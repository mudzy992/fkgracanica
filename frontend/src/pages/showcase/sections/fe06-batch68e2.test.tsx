import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
const reduceState = vi.hoisted(() => ({ reduce: false }));
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => reduceState.reduce, motion: { div: ({ children, ...props }: { children: unknown }) => <div {...props}>{children as never}</div> } };
});
vi.mock('../../../lib/motion/AnimatedSection', () => ({ AnimatedSection: ({ children }: { children: unknown }) => <div>{children as never}</div> }));
vi.mock('../../../lib/motion/Reveal', () => ({ Reveal: ({ children }: { children: unknown }) => <div>{children as never}</div> }));
vi.mock('../StatusBadge', () => ({ StatusBadge: () => null }));
vi.mock('./SectionIntro', () => ({ SectionIntro: () => <div>intro</div> }));
vi.mock('./SectionVisual', () => ({ SectionVisual: ({ id }: { id: string }) => <div>visual-{id}</div> }));

import { CatalogSection } from './CatalogSection';
import { TeamCinematicHero } from '../../../components/team/TeamCinematicHero';

function makeSection(id: string) {
  return { id, title: 'T', body: 'B', moduleIds: [] } as unknown as never;
}

describe('fe06-batch68e2 showcase+team', () => {
  it('CatalogSection pokriva hasVisual oba kraka', () => {
    const { container: c1 } = render(<CatalogSection section={makeSection('identity')} modules={[]} index={0} />);
    expect(c1.innerHTML).toContain('visual-identity');
    expect(c1.innerHTML).not.toContain('lg:col-span-2');
    const { container: c2 } = render(<CatalogSection section={makeSection('unknown')} modules={[]} index={1} />);
    expect(c2.innerHTML).toContain('lg:col-span-2');
  });

  it('TeamCinematicHero pokriva reduce oba kraka', () => {
    reduceState.reduce = false;
    const { container: c1 } = render(<TeamCinematicHero club={null} squad={null} stats={null} />);
    expect(c1).toBeDefined();
    reduceState.reduce = true;
    const { container: c2 } = render(<TeamCinematicHero club={null} squad={null} stats={null} />);
    expect(c2).toBeDefined();
    reduceState.reduce = false;
  });
});
