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
});
