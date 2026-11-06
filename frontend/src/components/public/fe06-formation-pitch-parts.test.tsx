import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FormationPitch } from './clubs/FormationPitch';
import { PitchPlayerToken } from './clubs/PitchPlayerToken';
import { ResponsiveFormationPitch } from './clubs/ResponsiveFormationPitch';

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const slot = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  clubId: 'c1',
  slotIndex: 0,
  isBench: false,
  lineRole: 'DEF',
  positionX: 30,
  positionY: 40,
  playerId: null,
  player: null,
  ...over,
});

describe('PitchPlayerToken', () => {
  it('bez igrača prikazuje labelu pozicije', () => {
    wrap(<PitchPlayerToken slot={slot() as never} />);
    expect(screen.getByText('Odbrana')).toBeInTheDocument();
    expect(screen.getByText('Od')).toBeInTheDocument();
  });

  it('sa igračem prikazuje inicijal i prezime', () => {
    wrap(
      <PitchPlayerToken
        slot={slot({ player: { firstName: 'Amar', lastName: 'Hodžić', number: 9 } }) as never}
      />,
    );
    expect(screen.getByText('A. Hodžić')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('sa fotografijom igrača prikazuje sliku', () => {
    const { container } = wrap(
      <PitchPlayerToken
        slot={slot({ player: { firstName: 'A', lastName: 'B', photoPath: 'p/1.jpg' } }) as never}
      />,
    );
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('bez igrača i grba koristi upitnik za nepoznatu poziciju', () => {
    wrap(<PitchPlayerToken slot={slot({ lineRole: 'XYZ' }) as never} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('koristi grb kluba kad nema fotografije igrača', () => {
    const { container } = wrap(
      <PitchPlayerToken
        slot={slot() as never}
        crestFallback={{ name: 'FK Gračanica', crestPath: 'clubs/c.png' } as never}
      />,
    );
    expect(screen.getByRole('img', { name: 'FK Gračanica' })).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('klik je omogućen uz onClick', () => {
    const clicks: unknown[] = [];
    const { getByRole } = wrap(
      <PitchPlayerToken slot={slot() as never} onClick={() => clicks.push(1)} />,
    );
    getByRole('button').click();
    expect(clicks).toHaveLength(1);
  });

  it('bez onClick i bez editable dugme je onemogućeno', () => {
    const { getByRole } = wrap(<PitchPlayerToken slot={slot() as never} />);
    expect(getByRole('button')).toBeDisabled();
  });

  it('editable omogućava dugme bez onClick', () => {
    const { getByRole } = wrap(<PitchPlayerToken slot={slot() as never} editable />);
    expect(getByRole('button')).toBeEnabled();
  });
});

describe('FormationPitch', () => {
  it('prikazuje samo startne slotove i markings', () => {
    const { container } = wrap(
      <FormationPitch
        slots={[
          slot({ id: 'a', player: { firstName: 'Amar', lastName: 'Hodžić' } }),
          slot({ id: 'b', isBench: true, player: { firstName: 'Emir', lastName: 'Softić' } }),
        ] as never}
      />,
    );
    expect(screen.getByText('A. Hodžić')).toBeInTheDocument();
    expect(screen.queryByText('E. Softić')).toBeNull();
    expect(container.querySelectorAll('[class*="border-white"]').length).toBeGreaterThan(0);
  });

  it('horizontalni i vertikalni režim mijenjaju raspored', () => {
    const h = wrap(<FormationPitch slots={[slot()] as never} />);
    const horizontalLeft = h.container.querySelector('div[style]')?.getAttribute('style');
    expect(horizontalLeft).toContain('left: 30%');
    const v = wrap(<FormationPitch slots={[slot()] as never} horizontal={false} />);
    const verticalLeft = v.container.querySelector('div[style]')?.getAttribute('style');
    expect(verticalLeft).toContain('left: 40%');
    expect(verticalLeft).toContain('top: 70%');
  });

  it('premium i enlarged mijenjaju klasu terena', () => {
    const premium = wrap(<FormationPitch slots={[]} premium />);
    expect(premium.container.firstElementChild?.className).toContain('border-primary/20');
    const enlarged = wrap(<FormationPitch slots={[]} horizontal={false} enlarged />);
    expect(enlarged.container.firstElementChild?.className).toContain('max-w-lg');
  });

  it('klik na slot prosljeđuje slot', () => {
    const clicked: unknown[] = [];
    wrap(
      <FormationPitch
        slots={[slot({ id: 'x', player: { firstName: 'A', lastName: 'B' } })] as never}
        onSlotClick={(s) => clicked.push(s)}
      />,
    );
    screen.getByRole('button').click();
    expect((clicked[0] as { id: string }).id).toBe('x');
  });
});

describe('ResponsiveFormationPitch', () => {
  it('renderira dvije verzije terena', () => {
    const { container } = wrap(
      <ResponsiveFormationPitch slots={[slot({ player: { firstName: 'Amar', lastName: 'Hodžić' } })] as never} />,
    );
    expect(container.querySelector('.hidden.lg\\:block')).not.toBeNull();
    expect(container.querySelector('.lg\\:hidden')).not.toBeNull();
    expect(screen.getAllByText('A. Hodžić')).toHaveLength(2);
  });
});
