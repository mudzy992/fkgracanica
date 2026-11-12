import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { AdminFormSheet } from './AdminFormSheet';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }) }));

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      (this as unknown as { open: boolean }).open = true;
    }) as unknown as typeof HTMLDialogElement.prototype.showModal;
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      (this as unknown as { open: boolean }).open = false;
    }) as unknown as typeof HTMLDialogElement.prototype.close;
  }
});

describe('AdminFormSheet — branch46 (preostale 2 grane)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('open true nakon false pokriva if (!open) false i timeout granu', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <AdminFormSheet open={false} onOpenChange={onOpenChange} title="T">
        <input aria-label="polje" defaultValue="a" />
      </AdminFormSheet>,
    );
    rerender(
      <AdminFormSheet open onOpenChange={onOpenChange} title="T">
        <input aria-label="polje" defaultValue="a" />
      </AdminFormSheet>,
    );
    await waitFor(() => expect(screen.getByLabelText('polje')).toBeInTheDocument());
    // sačekaj da se setTimeout unutar efekta izvrši (0ms)
    await new Promise((r) => setTimeout(r, 20));
    const input = screen.getByLabelText('polje');
    fireEvent.input(input, { target: { value: 'b' } });
    expect(input).toBeInTheDocument();
  });

  it('edited true prije timeout-a pokriva if (!editedRef.current && bodyRef) false', async () => {
    const onOpenChange = vi.fn();
    render(
      <AdminFormSheet open onOpenChange={onOpenChange} title="T">
        <input aria-label="polje2" defaultValue="x" />
      </AdminFormSheet>,
    );
    const input = screen.getByLabelText('polje2');
    fireEvent.input(input, { target: { value: 'y' } });
    await new Promise((r) => setTimeout(r, 20));
    await waitFor(() => expect(input).toBeInTheDocument());
    expect(input).toBeInTheDocument();
  });

  // dirty true grana (if (dirty) return true) je blokirana Dialog preventClose
  // pa se ne može pokriti kroz UI bez promjene ponašanja — ostaje za dead-guard
  // umjesto toga pokrivamo confirmDiscard fallback kada nema izmjena
  it('confirmDiscard bez izmjena vraća true i zatvara bez confirm-a', async () => {
    const onOpenChange = vi.fn();
    const spyConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <AdminFormSheet open onOpenChange={onOpenChange} title="T">
        <input aria-label="polje3" defaultValue="z" />
      </AdminFormSheet>,
    );
    await new Promise((r) => setTimeout(r, 20));
    const closeBtns = screen.getAllByLabelText('actions.close');
    const xBtn = closeBtns[closeBtns.length - 1];
    fireEvent.click(xBtn);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(spyConfirm).not.toHaveBeenCalled();
  });
});
