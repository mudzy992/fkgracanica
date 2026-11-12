import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { ConfirmDialog } from './ConfirmDialog';

installDialogPolyfill();

describe('ConfirmDialog — zatvaranje bez potvrde', () => {
  it('X u zaglavlju i Odustani zovu onOpenChange(false) bez onConfirm', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Obrisati?"
        description="Nepovratno."
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
    const close = screen.getAllByRole('button', { name: 'Zatvori' });
    await user.click(close[close.length - 1]);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('potvrda zatvara dijalog nakon izvršenja akcije', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn(async () => {});
    render(
      <ConfirmDialog open onOpenChange={onOpenChange} title="Obrisati?" onConfirm={onConfirm} />,
    );
    await user.click(screen.getByRole('button', { name: 'Potvrdi' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
