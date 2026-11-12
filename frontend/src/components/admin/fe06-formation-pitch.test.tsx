import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormationEditablePitch, ResponsiveFormationEditablePitch } from './formation/FormationEditablePitch';
import { BenchDropRow } from './formation/BenchDropRow';
import type { ClubSquadSlot } from '../../types/club-hub';
import type { Player } from '../../types';

vi.mock('@dnd-kit/core', () => ({
  useDraggable: ({ id }: { id: string }) => ({
    setNodeRef: vi.fn(),
    listeners: { onPointerDown: vi.fn() },
    attributes: { role: 'button', 'data-drag': id },
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: () => '' } } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => ({ 'admin.formation.emptySpot': 'Prazno mjesto' } as Record<string, string>)[k] ?? k }) }));

const player = (over: Partial<Player> = {}): Player =>
  ({
    id: 'p1',
    firstName: 'Amar',
    lastName: 'Hodžić',
    number: 10,
    position: 'DEF',
    photoPath: null,
    ...over,
  }) as Player;

const slot = (over: Partial<ClubSquadSlot> = {}): ClubSquadSlot => ({
  id: 's1',
  clubId: 'c1',
  slotIndex: 0,
  isBench: false,
  lineRole: 'DEF',
  positionX: 50,
  positionY: 50,
  playerId: null,
  player: null,
  ...over,
});

describe('FormationEditablePitch', () => {
  it('prikazuje samo startne slotove', () => {
    render(
      <FormationEditablePitch
        slots={[
          slot({ id: 's1', playerId: 'p1', player: player() }),
          slot({ id: 's2', slotIndex: 1, isBench: true, playerId: 'p2', player: player({ id: 'p2' }) }),
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    expect(screen.getByText('A. Hodžić')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('prazna pozicija prikazuje skraćenicu uloge', () => {
    render(<FormationEditablePitch slots={[slot()]} activeSlot={null} onSlotClick={vi.fn()} />);
    expect(screen.getByText('Od')).toBeTruthy();
    expect(screen.getByText('Odbrana')).toBeTruthy();
  });

  it('igrač bez slike prikazuje broj', () => {
    render(
      <FormationEditablePitch
        slots={[slot({ playerId: 'p1', player: player({ number: 9 }) })]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    expect(screen.getByText('9')).toBeTruthy();
  });

  it('igrač sa slikom prikazuje fotografiju', () => {
    const { container } = render(
      <FormationEditablePitch
        slots={[slot({ playerId: 'p1', player: player({ photoPath: 'originals/p1.jpg' }) })]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toContain('p1');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('klik na slot javlja slot sa mapiranim koordinatama', async () => {
    const onSlotClick = vi.fn();
    render(
      <FormationEditablePitch
        slots={[slot({ positionX: 20, positionY: 80 })]}
        activeSlot={null}
        onSlotClick={onSlotClick}
      />,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSlotClick).toHaveBeenCalledTimes(1);
    expect(onSlotClick.mock.calls[0][0].positionX).toBeTypeOf('number');
  });

  it('aktivni slot dobija prsten, a pending smanjuje prozirnost', () => {
    const active = slot({ slotIndex: 0 });
    const { container } = render(
      <FormationEditablePitch slots={[active]} activeSlot={active} onSlotClick={vi.fn()} pending />,
    );
    expect(container.querySelector('.ring-2')).toBeTruthy();
    expect(container.firstElementChild?.className).toContain('opacity-70');
  });

  it('prazan broj i uloga daju upitnik', () => {
    render(
      <FormationEditablePitch
        slots={[slot({ lineRole: 'NEPOZNATO' as never, playerId: null })]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    expect(screen.getByText('?')).toBeTruthy();
  });

  it('responsive varijanta renderira dvije verzije', () => {
    const { container } = render(
      <ResponsiveFormationEditablePitch slots={[slot()]} activeSlot={null} onSlotClick={vi.fn()} />,
    );
    expect(container.querySelectorAll('.relative.w-full')).toHaveLength(2);
  });

  it('vertikalna varijanta ima omjer 3/4', () => {
    const { container } = render(
      <FormationEditablePitch slots={[slot()]} activeSlot={null} onSlotClick={vi.fn()} horizontal={false} />,
    );
    expect(container.firstElementChild?.className).toContain('aspect-[3/4]');
  });
});

describe('BenchDropRow', () => {
  it('prazno mjesto prikazuje rezervni tekst', () => {
    render(<BenchDropRow slot={slot({ isBench: true }) as never} active={false} onSelect={vi.fn()} />);
    expect(screen.getByText('Prazno mjesto')).toBeTruthy();
  });

  it('igrač na klupi prikazuje puno ime i javlja odabir', async () => {
    const onSelect = vi.fn();
    render(
      <BenchDropRow
        slot={slot({ isBench: true, playerId: 'p1', player: player() }) as never}
        active
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText('Amar Hodžić')).toBeTruthy();
    const row = screen.getByRole('button');
    expect(row.className).toContain('border-primary');
    await userEvent.click(row);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
