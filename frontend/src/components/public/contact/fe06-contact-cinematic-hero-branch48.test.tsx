import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ContactCinematicHero } from './ContactCinematicHero';

const motionState = vi.hoisted(() => ({ reduce: false as boolean }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: { children: unknown }) => <div {...props}>{children as never}</div>,
    },
    useReducedMotion: () => motionState.reduce,
  };
});

describe('ContactCinematicHero — branch48 (reduce + chips length)', () => {
  beforeEach(() => {
    motionState.reduce = false;
  });

  it('reduce=false i 3 chipa → grid-cols-3 (pokriva else grane)', () => {
    motionState.reduce = false;
    const { container } = render(<ContactCinematicHero hasEmail hasPhone hasAddress />);
    expect(screen.getByText('contactPage.email')).toBeInTheDocument();
    expect(screen.getByText('contactPage.phone')).toBeInTheDocument();
    expect(screen.getByText('contactPage.address')).toBeInTheDocument();
    expect(container.querySelector('.grid-cols-3')).not.toBeNull();
  });

  it('reduce=true i 1 chip → pokriva bid3 [0,3] i bid5 [0,2] grid-cols-1', () => {
    motionState.reduce = true;
    const { container } = render(<ContactCinematicHero hasEmail hasPhone={false} hasAddress={false} />);
    expect(screen.getByText('contactPage.email')).toBeInTheDocument();
    expect(screen.queryByText('contactPage.phone')).toBeNull();
    expect(container.querySelector('.grid-cols-1')).not.toBeNull();
  });

  it('2 chipa → grid-cols-2 i bez emaila', () => {
    motionState.reduce = false;
    const { container } = render(<ContactCinematicHero hasEmail={false} hasPhone hasAddress />);
    expect(screen.queryByText('contactPage.email')).toBeNull();
    expect(screen.getByText('contactPage.phone')).toBeInTheDocument();
    expect(screen.getByText('contactPage.address')).toBeInTheDocument();
    expect(container.querySelector('.grid-cols-2')).not.toBeNull();
  });

  it('bez chipova ne renderuje grid', () => {
    const { container } = render(<ContactCinematicHero hasEmail={false} hasPhone={false} hasAddress={false} />);
    expect(container.querySelector('.grid-cols-1')).toBeNull();
    expect(container.querySelector('.grid-cols-2')).toBeNull();
    expect(container.querySelector('.grid-cols-3')).toBeNull();
  });
});
