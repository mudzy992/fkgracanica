import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TicketCategory } from '../../../types/ticketing-config';
import { TicketingCategoriesEditor } from './TicketingCategoriesEditor';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const state = { changes: [] as TicketCategory[][] };
const last = () => state.changes[state.changes.length - 1];

const base: TicketCategory[] = [
  { id: 'tribina', label: 'Tribina', price: 5, isActive: true },
  { id: 'vip', label: 'VIP', price: 15, isActive: false },
];

function Harness({ initial }: { initial: TicketCategory[] }) {
  const [categories, setCategories] = useState(initial);
  return (
    <TicketingCategoriesEditor
      categories={categories}
      onChange={(next) => {
        state.changes.push(next);
        setCategories(next);
      }}
    />
  );
}

const renderEditor = (initial: TicketCategory[] = base) => render(<Harness initial={initial} />);

describe('TicketingCategoriesEditor', () => {
  beforeEach(() => {
    state.changes = [];
  });

  it('prikazuje sve kategorije sa nazivom, cijenom i stanjem', () => {
    renderEditor();
    expect(screen.getByDisplayValue('Tribina')).toBeTruthy();
    expect(screen.getByDisplayValue('5')).toBeTruthy();
    expect(screen.getByDisplayValue('VIP')).toBeTruthy();
    expect(screen.getByDisplayValue('15')).toBeTruthy();
    const switches = screen.getAllByRole('switch');
    expect(switches[0].getAttribute('aria-checked')).toBe('true');
    expect(switches[1].getAttribute('aria-checked')).toBe('false');
  });

  it('izmjena naziva emituje novu listu sa istim ostalim poljima', async () => {
    renderEditor();
    await userEvent.type(screen.getByDisplayValue('Tribina'), '!');
    expect(last()).toEqual([
      { id: 'tribina', label: 'Tribina!', price: 5, isActive: true },
      { id: 'vip', label: 'VIP', price: 15, isActive: false },
    ]);
  });

  it('izmjena cijene pretvara unos u broj', async () => {
    renderEditor();
    const price = screen.getByDisplayValue('5');
    await userEvent.clear(price);
    await userEvent.type(price, '12.5');
    expect(last()[0]).toMatchObject({ id: 'tribina', price: 12.5 });
  });

  it('prekidač mijenja isActive u oba smjera', async () => {
    renderEditor();
    await userEvent.click(screen.getAllByRole('switch')[1]);
    expect(last()[1]).toMatchObject({ id: 'vip', isActive: true });
    await userEvent.click(screen.getAllByRole('switch')[0]);
    expect(last()[0]).toMatchObject({ id: 'tribina', isActive: false });
  });

  it('brisanje uklanja samo odabranu kategoriju', async () => {
    renderEditor();
    await userEvent.click(screen.getAllByRole('button', { name: 'actions.delete' })[0]);
    expect(last()).toEqual([{ id: 'vip', label: 'VIP', price: 15, isActive: false }]);
  });

  it('dodavanje kreira novu aktivnu kategoriju sa cijenom 5', async () => {
    renderEditor([base[0]]);
    await userEvent.click(screen.getByRole('button', { name: /Dodaj kategoriju/ }));
    const next = last();
    expect(next).toHaveLength(2);
    expect(next[1]).toMatchObject({ label: 'Nova kategorija', price: 5, isActive: true });
    expect(next[1].id).toMatch(/^cat-\d+$/);
    expect(screen.getByDisplayValue('Nova kategorija')).toBeTruthy();
  });

  it('prazna lista prikazuje samo dugme za dodavanje', () => {
    renderEditor([]);
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
    expect(screen.getByRole('button', { name: /Dodaj kategoriju/ })).toBeTruthy();
  });

  it('vanjska promjena liste zamjenjuje lokalni nacrt', () => {
    const { rerender } = render(<Harness initial={base} />);
    rerender(
      <TicketingCategoriesEditor
        categories={[{ id: 'novi', label: 'Nova', price: 9, isActive: true }]}
        onChange={(next) => state.changes.push(next)}
      />,
    );
    expect(screen.getByDisplayValue('Nova')).toBeTruthy();
    expect(screen.queryByDisplayValue('Tribina')).toBeNull();
  });
});
