import { StrictMode, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { Dialog, DialogBody, DialogHeader } from './dialog';

installDialogPolyfill();
afterEach(() => { document.body.style.overflow = ''; vi.restoreAllMocks(); });

function Example({ preventClose = false }: { preventClose?: boolean }) {
  const [open, setOpen] = useState(false);
  const [nested, setNested] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Otvori dijalog</button>
      <Dialog open={open} onOpenChange={setOpen} preventClose={preventClose}>
        <DialogHeader onClose={() => setOpen(false)} preventClose={preventClose}>Vanjski</DialogHeader>
        <DialogBody>
          <button onClick={() => setNested(true)}>Otvori potvrdu</button>
          <Dialog open={nested} onOpenChange={setNested}>
            <DialogHeader onClose={() => setNested(false)}>Potvrda</DialogHeader>
            <DialogBody><button onClick={() => setNested(false)}>Odustani</button></DialogBody>
          </Dialog>
        </DialogBody>
      </Dialog>
    </>
  );
}

function cancel(dialog: HTMLElement) {
  fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }));
}

describe('samostalni Dialog', () => {
  it('ima ime, početni fokus, Tab trap, Escape i povrat fokusa/scrolla', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'scroll';
    render(<StrictMode><Example /></StrictMode>);
    const opener = screen.getByRole('button', { name: 'Otvori dijalog' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Vanjski' });
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const close = within(dialog).getAllByRole('button', { name: 'Zatvori' }).find((b) => b.tabIndex === 0)!;
    const last = within(dialog).getByRole('button', { name: 'Otvori potvrdu' });
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList);
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(close).toHaveFocus();
    cancel(dialog);
    expect(screen.queryByRole('dialog', { name: 'Vanjski' })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('zatvara se podlogom; preventClose blokira Escape, podlogu i X', async () => {
    const user = userEvent.setup();
    const view = render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Otvori dijalog' }));
    const dialog = screen.getByRole('dialog', { name: 'Vanjski' });
    await user.click(dialog.querySelector('button[tabindex="-1"]')!);
    expect(screen.queryByRole('dialog', { name: 'Vanjski' })).not.toBeInTheDocument();
    view.rerender(<Example preventClose />);
    await user.click(screen.getByRole('button', { name: 'Otvori dijalog' }));
    const locked = screen.getByRole('dialog', { name: 'Vanjski' });
    cancel(locked);
    await user.click(locked.querySelector('button[tabindex="-1"]')!);
    expect(within(locked).getAllByRole('button', { name: 'Zatvori' }).find((b) => b.tabIndex === 0)).toBeDisabled();
    expect(locked).toBeInTheDocument();
  });

  it('ugniježđeni Dialog zatvara se prvi i vraća fokus bez otključavanja roditelja', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Otvori dijalog' });
    await user.click(trigger);
    const outer = screen.getByRole('dialog', { name: 'Vanjski' });
    const nestedTrigger = within(outer).getByRole('button', { name: 'Otvori potvrdu' });
    await user.click(nestedTrigger);
    const nested = screen.getByRole('dialog', { name: 'Potvrda' });
    expect(nested.tagName).toBe('DIALOG');
    cancel(nested);
    expect(screen.queryByRole('dialog', { name: 'Potvrda' })).not.toBeInTheDocument();
    expect(outer).toBeInTheDocument();
    expect(nestedTrigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    cancel(outer);
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });
});
