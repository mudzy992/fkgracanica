import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { AdminFormSheet } from './AdminFormSheet';

installDialogPolyfill();

function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Otvori formu</button>
      <AdminFormSheet open={open} onOpenChange={setOpen} title="Uređivanje">
        <label>Naziv <input defaultValue="Početno" /></label>
      </AdminFormSheet>
    </>
  );
}

describe('AdminFormSheet — zatvaranje i zaštita', () => {
  it('X dugme zatvara formu bez izmjena', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Otvori formu' }));
    const closeButtons = screen.getAllByRole('button', { name: 'Zatvori' });
    await user.click(closeButtons[closeButtons.length - 1]);
    expect(screen.queryByRole('dialog', { name: 'Uređivanje' })).not.toBeInTheDocument();
  });

  it('beforeunload se blokira samo kad ima nesačuvanih izmjena', () => {
    render(
      <AdminFormSheet open onOpenChange={vi.fn()} title="Zaštita">
        <label>Naziv <input defaultValue="x" /></label>
      </AdminFormSheet>,
    );
    const clean = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);
  });
});

describe('AdminFormSheet i modalni Dialog', () => {
  it('ne odbacuje izmjenu ako se potvrda zatvaranja odbije', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Otvori formu' });
    await user.click(trigger);
    const form = screen.getByRole('dialog', { name: 'Uređivanje' });
    await user.clear(within(form).getByLabelText('Naziv'));
    await user.type(within(form).getByLabelText('Naziv'), 'Izmjena');
    fireEvent(form, new Event('cancel', { cancelable: true }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(form).toBeInTheDocument();
    expect(within(form).getByLabelText('Naziv')).toHaveValue('Izmjena');
    fireEvent(form, new Event('cancel', { cancelable: true }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('dialog', { name: 'Uređivanje' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('dirty prop zatvara bez pitanja i bez potvrde', async () => {
    const onOpenChange = vi.fn();
    const confirm = vi.spyOn(window, 'confirm');
    render(
      <AdminFormSheet open onOpenChange={onOpenChange} title="Zaključano" dirty>
        <label>Naziv <input defaultValue="x" /></label>
      </AdminFormSheet>,
    );
    const closes = screen.getAllByRole('button', { name: 'Zatvori' });
    expect(closes[closes.length - 1]).toBeDisabled();
    fireEvent(screen.getByRole('dialog', { name: 'Zaključano' }), new Event('cancel', { cancelable: true }));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    confirm.mockRestore();
  });
});
