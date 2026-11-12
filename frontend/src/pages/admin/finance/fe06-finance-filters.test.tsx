import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FinanceFiltersForm } from './FinanceFiltersForm';
import { FinanceProviderChip } from './FinanceProviderChip';
import type { FinanceFilters } from '../../../hooks/use-finance-summary';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const empty: FinanceFilters = { from: '', to: '', status: '', provider: '' };

const Harness = ({ onApply }: { onApply: () => void }) => {
  const [draft, setDraft] = useState<FinanceFilters>(empty);
  return <FinanceFiltersForm draft={draft} setDraft={setDraft} onApply={onApply} />;
};

const dateInputs = () => document.querySelectorAll('input[type="date"]');

describe('FinanceFiltersForm', () => {
  it('prikazuje polja Od, Do i status', () => {
    render(<Harness onApply={() => {}} />);
    expect(screen.getByText('Od')).toBeTruthy();
    expect(screen.getByText('Do')).toBeTruthy();
    expect(screen.getByText('admin.financeFilters.status')).toBeTruthy();
    expect(dateInputs()).toHaveLength(2);
  });

  it('status select sadrži sve opcije iz labela', () => {
    render(<Harness onApply={() => {}} />);
    const select = screen.getByRole('combobox');
    ['Svi statusi', 'Plaćeno', 'Čeka online uplatu', 'Čeka blagajnu', 'Povraćeno', 'Otkazano'].forEach(
      (label) => expect(screen.getByRole('option', { name: label })).toBeTruthy(),
    );
    expect((select as HTMLSelectElement).value).toBe('');
  });

  it('promjena datuma i statusa ažurira draft', async () => {
    render(<Harness onApply={() => {}} />);
    const [from, to] = Array.from(dateInputs()) as HTMLInputElement[];
    await userEvent.type(from, '2026-05-01');
    await userEvent.type(to, '2026-05-31');
    expect(from.value).toBe('2026-05-01');
    expect(to.value).toBe('2026-05-31');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'CONFIRMED');
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('CONFIRMED');
  });

  it('submit poziva onApply bez reload-a forme', async () => {
    const onApply = vi.fn();
    render(<Harness onApply={onApply} />);
    await userEvent.click(screen.getByRole('button', { name: 'admin.financeFilters.period' }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('„Svi načini“ je pritisnut kad nema providera i čisti izbor', async () => {
    render(<Harness onApply={() => {}} />);
    const all = screen.getByRole('button', { name: 'Svi načini' });
    expect(all.getAttribute('aria-pressed')).toBe('true');
    const stripe = screen.getByRole('button', { name: 'Stripe' });
    await userEvent.click(stripe);
    expect(stripe.getAttribute('aria-pressed')).toBe('true');
    expect(all.getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(screen.getByRole('button', { name: 'Svi načini' }));
    expect(all.getAttribute('aria-pressed')).toBe('true');
  });

  it('ponovni klik na isti provider ga isključuje', async () => {
    render(<Harness onApply={() => {}} />);
    const box = screen.getByRole('button', { name: 'Blagajna' });
    await userEvent.click(box);
    expect(box.getAttribute('aria-pressed')).toBe('true');
    await userEvent.click(box);
    expect(box.getAttribute('aria-pressed')).toBe('false');
  });

  it('prikazuje napomenu o filteru načina plaćanja', () => {
    render(<Harness onApply={() => {}} />);
    expect(screen.getByText(/Filter načina vrijedi za ulaznice/)).toBeTruthy();
    expect(screen.getByText('admin.financeFilters.method')).toBeTruthy();
  });
});

describe('FinanceProviderChip', () => {
  it('bez onClick je span i nema cursor', () => {
    const { container } = render(<FinanceProviderChip id="stripe" />);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.tagName).toBe('SPAN');
    expect(chip.className).not.toContain('cursor-pointer');
  });

  it('sa onClick je dugme sa aria-pressed', async () => {
    const onClick = vi.fn();
    render(<FinanceProviderChip id="stripe" selected onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Stripe' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('nepoznat provider koristi svoj naziv kao labelu', () => {
    render(<FinanceProviderChip id="nepoznat" />);
    expect(screen.getByText('nepoznat')).toBeTruthy();
  });
});
