import { StrictMode, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { Dialog, DialogBody, DialogHeader } from './dialog';
import { Sheet, SheetContent, SheetHeader } from './sheet';

installDialogPolyfill();

afterEach(() => { document.body.style.overflow = ''; vi.restoreAllMocks(); });

function Example({ preventClose = false }: { preventClose?: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Otvori meni</button>
      <Sheet open={open} onOpenChange={setOpen} side="right">
        <SheetHeader onClose={() => setOpen(false)}>Meni</SheetHeader>
        <SheetContent><button onClick={() => setConfirm(true)}>Obriši mapu</button></SheetContent>
      </Sheet>
      <Dialog open={confirm} onOpenChange={setConfirm} preventClose={preventClose}>
        <DialogHeader onClose={() => setConfirm(false)} preventClose={preventClose}>Potvrda</DialogHeader>
        <DialogBody><button onClick={() => setConfirm(false)}>Odustani</button></DialogBody>
      </Dialog>
    </>
  );
}

function cancel(dialog: HTMLElement) {
  fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }));
}

describe('Sheet modal', () => {
  it('ima naziv, početni fokus, Escape i vraća fokus i prethodni scroll', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'scroll';
    render(<StrictMode><Example /></StrictMode>);
    const trigger = screen.getByRole('button', { name: 'Otvori meni' });
    await user.click(trigger);
    const sheet = screen.getByRole('dialog', { name: 'Meni' });
    expect(sheet).toHaveAttribute('aria-modal', 'true');
    expect(within(sheet).getAllByRole('button', { name: 'Zatvori' }).find((button) => button.tabIndex === 0)).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    cancel(sheet);
    expect(screen.queryByRole('dialog', { name: 'Meni' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('prevodi dostupni naziv zatvaranja', async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage('en');
    try {
      render(<Example />);
      await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
      const sheet = screen.getByRole('dialog', { name: 'Meni' });
      expect(within(sheet).getAllByRole('button', { name: 'Close' })).toHaveLength(2);
    } finally {
      await i18n.changeLanguage('bs');
    }
  });

  it('zatvara se klikom na podlogu i zadržava Tab unutar modala', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    const sheet = screen.getByRole('dialog', { name: 'Meni' });
    const close = within(sheet).getAllByRole('button', { name: 'Zatvori' }).find((button) => button.tabIndex === 0);
    const last = within(sheet).getByRole('button', { name: 'Obriši mapu' });
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList);
    expect(close).toBeDefined();
    close!.focus();
    fireEvent.keyDown(close!, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(close).toHaveFocus();
    const backdrop = sheet.querySelector('button[tabindex="-1"]');
    expect(backdrop).not.toBeNull();
    await user.click(backdrop!);
    expect(screen.queryByRole('dialog', { name: 'Meni' })).not.toBeInTheDocument();
  });

  it('pri uklanjanju otvorenog Sheeta vraća prethodni scroll', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'auto';
    const view = render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    expect(document.body.style.overflow).toBe('hidden');
    view.unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('preventClose štiti ugniježđeni dijalog i Sheet od Escapea i podloge', async () => {
    const user = userEvent.setup();
    render(<Example preventClose />);
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    const sheet = screen.getByRole('dialog', { name: 'Meni' });
    await user.click(within(sheet).getByRole('button', { name: 'Obriši mapu' }));
    const confirmation = screen.getByRole('dialog', { name: 'Potvrda' });
    cancel(confirmation);
    const backdrop = confirmation.querySelector('button[tabindex="-1"]');
    expect(backdrop).not.toBeNull();
    await user.click(backdrop!);
    expect(confirmation).toBeInTheDocument();
    expect(sheet).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('ugniježđena potvrda se zatvara prva bez otključavanja Sheeta', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    const sheet = screen.getByRole('dialog', { name: 'Meni' });
    const opener = within(sheet).getByRole('button', { name: 'Obriši mapu' });
    await user.click(opener);
    const confirmation = screen.getByRole('dialog', { name: 'Potvrda' });
    expect(confirmation.tagName).toBe('DIALOG');
    expect(within(confirmation).getAllByRole('button', { name: 'Zatvori' }).find((button) => button.tabIndex === 0)).toHaveFocus();
    cancel(confirmation);
    expect(screen.queryByRole('dialog', { name: 'Potvrda' })).not.toBeInTheDocument();
    expect(sheet).toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    cancel(sheet);
    expect(document.body.style.overflow).toBe('');
  });
});
