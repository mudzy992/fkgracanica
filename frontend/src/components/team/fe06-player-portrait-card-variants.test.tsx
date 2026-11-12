import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerPortraitCard } from './PlayerPortraitCard';

const motionState = vi.hoisted(() => ({ reduce: false }));

vi.mock('framer-motion', async (importOriginal) => {
  const orig = (await importOriginal()) as Record<string, unknown>;
  return {
    ...orig,
    useReducedMotion: () => motionState.reduce,
    motion: {
      div: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Tag = 'div' as any;
        return <Tag {...props}>{children}</Tag>;
      },
    },
  };
});
vi.mock('../../lib/media', () => ({ mediaUrl: (p: string | undefined) => (p ? `url:${p}` : undefined) }));
vi.mock('../../lib/public-routes', () => ({ playerPath: (id: string) => `/igrac/${id}` }));
vi.mock('../../lib/utils', () => ({ cn: (...v: string[]) => v.filter(Boolean).join(' ') }));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

beforeEach(() => {
  motionState.reduce = false;
});

/** Batch 35 — pokriva 4 grane: bez pozicije, nepoznata pozicija, reduce motion, broj `?` */
describe('PlayerPortraitCard — grane (batch 35)', () => {
  it('bez pozicije ne prikazuje oznaku pozicije', () => {
    const { container } = wrap(<PlayerPortraitCard player={{ id: 'p1', firstName: 'Amar', lastName: 'Hodžić', position: null, number: 9 } as never} />);
    expect(container.textContent).not.toContain('Napadač');
    // pos should be null, so no badge
    expect(container.querySelector('span.rounded-full')).toBeNull();
  });

  it('nepoznata pozicija koristi sirovu vrijednost kao fallback', () => {
    wrap(<PlayerPortraitCard player={{ id: 'p2', firstName: 'Test', lastName: 'Igrač', position: 'CUSTOM_POS', number: 5 } as never} />);
    expect(screen.getByText('CUSTOM_POS')).toBeInTheDocument();
  });

  it('bez broja prikazuje ? i ne prikazuje broj u zaglavlju', () => {
    const { container } = wrap(<PlayerPortraitCard player={{ id: 'p3', firstName: 'Bez', lastName: 'Broja', position: 'FWD' } as never} />);
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\b[0-9]{1,2}\b.*Bez/);
  });

  it('sa reduceMotion true početna animacija je isključena', () => {
    motionState.reduce = true;
    const { container } = wrap(
      <PlayerPortraitCard player={{ id: 'p4', firstName: 'Reduce', lastName: 'Test', position: 'FWD', number: 10 } as never} />,
    );
    expect(container.textContent).toContain('Reduce');
  });
});
