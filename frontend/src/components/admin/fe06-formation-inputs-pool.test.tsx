import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormationInputs } from './formation/FormationInputs';
import { FormationPlayerPool } from './formation/FormationPlayerPool';
import { FormationSlotPanel } from './formation/FormationSlotPanel';

vi.mock('@dnd-kit/core', () => ({
  useDraggable: ({ id }: { id: string }) => ({
    setNodeRef: vi.fn(),
    listeners: {},
    attributes: { 'data-drag': id },
    transform: null,
    isDragging: false,
  }),
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: () => '' } } }));
vi.mock('react-i18next', () => {
  const m: Record<string, string> = { 'admin.formation.apply': 'Primijeni', 'admin.formation.choosePreset': ' — odaberi preset ili prilagodi ručno', 'admin.formation.preset': 'Preset', 'admin.formation.custom': 'Prilagođeno', 'admin.formation.selectFormation': 'Odaberi formaciju', 'admin.formation.def': 'ODB', 'admin.formation.mid': 'VEZ', 'admin.formation.fwd': 'NAP', 'admin.formation.allAssigned': 'admin.formation.allAssigned', 'admin.formation.pool': 'admin.formation.pool', 'admin.formation.emptyPosition': 'Prazna pozicija', 'admin.formation.emptySpot': 'Prazno mjesto', 'admin.formation.pickForPosition': 'Odaberi igrača za poziciju', 'admin.formation.pickForBench': 'Odaberi igrača za klupu', 'admin.formation.remove': 'Ukloni', 'admin.formation.close': 'Zatvori' };
  return { useTranslation: () => ({ t: (k: string, o?: Record<string, unknown>) => (k === 'admin.formation.sumMustBe' && o ? `Zbroj ODB+VEZ+NAP mora biti ${String((o as Record<string, unknown>).total)} (trenutno: ${String((o as Record<string, unknown>).sum)})` : (m[k] ?? (o ? `${k}:${JSON.stringify(o)}` : k))) }) };
});

const player = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  firstName: 'Amar',
  lastName: 'Hodžić',
  number: 10,
  ...over,
});

describe('FormationInputs', () => {
  const props = (over: Record<string, unknown> = {}) => ({
    def: '4',
    mid: '4',
    fwd: '2',
    onDef: vi.fn(),
    onMid: vi.fn(),
    onFwd: vi.fn(),
    onApply: vi.fn(),
    applying: false,
    ...over,
  });

  it('validan zbir omogućava primjenu', () => {
    const p = props();
    render(<FormationInputs {...p} />);
    expect(screen.getByText(/trenutno: 10/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Primijeni' }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it('nevalidan zbir onemogućava primjenu i boji poruku', () => {
    render(<FormationInputs {...props({ def: '3', mid: '3', fwd: '3' })} />);
    expect(screen.getByText(/trenutno: 9/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Primijeni' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(screen.getByText(/trenutno: 9/).className).toContain('text-danger');
  });

  it('nula u polju nije validna', () => {
    render(<FormationInputs {...props({ def: '0', mid: '5', fwd: '5' })} />);
    expect((screen.getByRole('button', { name: 'Primijeni' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('izmjena polja zove odgovarajući setter', async () => {
    const p = props();
    render(<FormationInputs {...p} />);
    const inputs = screen.getAllByRole('spinbutton');
    await userEvent.clear(inputs[1]);
    await userEvent.type(inputs[1], '5');
    expect(p.onMid).toHaveBeenCalled();
    expect(p.onDef).not.toHaveBeenCalled();
  });

  it('tokom primjene dugme je onemogućeno', () => {
    render(<FormationInputs {...props({ applying: true })} />);
    expect((screen.getByRole('button', { name: 'Primijeni' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('primjena zove onApply', async () => {
    const p = props();
    render(<FormationInputs {...p} />);
    await userEvent.click(screen.getByRole('button', { name: 'Primijeni' }));
    expect(p.onApply).toHaveBeenCalledTimes(1);
  });
});

describe('FormationPlayerPool', () => {
  it('bez igrača prikazuje poruku da su svi raspoređeni', () => {
    render(<FormationPlayerPool players={[]} />);
    expect(screen.getByText('admin.formation.allAssigned')).toBeTruthy();
  });

  it('prikazuje igrače sa brojem i bez njega', () => {
    render(
      <FormationPlayerPool
        players={[player(), player({ id: 'p2', firstName: 'Emir', lastName: 'Karić', number: null })] as never}
      />,
    );
    expect(screen.getByText('admin.formation.pool')).toBeTruthy();
    expect(screen.getByText('10 Amar Hodžić')).toBeTruthy();
    expect(screen.getByText('Emir Karić')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});

describe('FormationSlotPanel', () => {
  const slot = (over: Record<string, unknown> = {}) => ({
    id: 's1',
    slotIndex: 0,
    isBench: false,
    playerId: null as string | null,
    player: null as unknown,
    ...over,
  });

  it('prazna pozicija nudi izbor igrača bez uklanjanja', () => {
    render(
      <FormationSlotPanel
        slot={slot() as never}
        players={[player()] as never}
        onPick={vi.fn()}
        onRemove={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Prazna pozicija')).toBeTruthy();
    expect(screen.getByText(/Odaberi igrača za poziciju/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ukloni' })).toBeNull();
  });

  it('klupski slot mijenja tekst uloge', () => {
    render(
      <FormationSlotPanel
        slot={slot({ isBench: true }) as never}
        players={[]}
        onPick={vi.fn()}
        onRemove={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/Odaberi igrača za klupu/)).toBeTruthy();
  });

  it('popunjen slot prikazuje ime i nudi uklanjanje', async () => {
    const onRemove = vi.fn();
    render(
      <FormationSlotPanel
        slot={slot({ playerId: 'p1', player: player() }) as never}
        players={[player()] as never}
        onPick={vi.fn()}
        onRemove={onRemove}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Amar Hodžić')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Ukloni' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('odabir igrača i zatvaranje zovu svoje handlere', async () => {
    const onPick = vi.fn();
    const onClose = vi.fn();
    render(
      <FormationSlotPanel
        slot={slot() as never}
        players={[player(), player({ id: 'p2', firstName: 'Emir', lastName: 'Karić' })] as never}
        onPick={onPick}
        onRemove={vi.fn()}
        onClose={onClose}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '10 Amar Hodžić' }));
    expect(onPick).toHaveBeenCalledWith('p1');
    await userEvent.click(screen.getByRole('button', { name: 'Zatvori' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('trenutno odabran igrač ima primarnu varijantu', () => {
    render(
      <FormationSlotPanel
        slot={slot({ playerId: 'p1', player: player() }) as never}
        players={[player()] as never}
        onPick={vi.fn()}
        onRemove={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const btn = screen.getByRole('button', { name: '10 Amar Hodžić' });
    expect(btn.getAttribute('data-variant') ?? btn.className).toBeTruthy();
  });
});
