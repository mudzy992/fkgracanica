import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { trapModalTab } from './modal-effects';

/** Batch 34 — Tab/Shift+Tab ciklus unutar `<dialog>` (odvojeno zbog limita dužine). */

/** jsdom nema layout — `getClientRects` mora vratiti bar jedan pravougaonik. */
const rect = () => [{ width: 10, height: 10 }] as unknown as DOMRectList;
beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(rect());
});

describe('trapModalTab', () => {
  const mountDialog = () =>
    render(
      <dialog open data-testid="dialog">
        <button>prvo</button>
        <button>srednje</button>
        <button>zadnje</button>
      </dialog>,
    );

  it('ignoriše taster koji nije Tab', () => {
    mountDialog();
    const dialog = screen.getByTestId('dialog') as HTMLDialogElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    Object.defineProperty(event, 'currentTarget', { value: dialog });
    expect(trapModalTab(event as never)).toBeUndefined();
    expect(event.defaultPrevented).toBe(false);
  });

  it('Shift+Tab sa fokusa na ivici vraća na zadnje polje', () => {
    mountDialog();
    const dialog = screen.getByTestId('dialog') as HTMLDialogElement;
    const [first, , last] = Array.from(dialog.querySelectorAll('button'));
    first.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    Object.defineProperty(event, 'currentTarget', { value: dialog });
    trapModalTab(event as never);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(last);
  });

  it('Shift+Tab sa sredine ne mijenja fokus', () => {
    mountDialog();
    const dialog = screen.getByTestId('dialog') as HTMLDialogElement;
    const middle = Array.from(dialog.querySelectorAll('button'))[1];
    middle.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    Object.defineProperty(event, 'currentTarget', { value: dialog });
    trapModalTab(event as never);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(middle);
  });

  it('Tab sa zadnjeg polja vraća na prvo', () => {
    mountDialog();
    const dialog = screen.getByTestId('dialog') as HTMLDialogElement;
    const [first, , last] = Array.from(dialog.querySelectorAll('button'));
    last.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(event, 'currentTarget', { value: dialog });
    trapModalTab(event as never);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
  });

  it('Tab sa sredine ne mijenja fokus', () => {
    mountDialog();
    const dialog = screen.getByTestId('dialog') as HTMLDialogElement;
    const middle = Array.from(dialog.querySelectorAll('button'))[1];
    middle.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(event, 'currentTarget', { value: dialog });
    trapModalTab(event as never);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(middle);
  });

  it('bez fokusabilnih elemenata fokusira sam dijalog', () => {
    render(<dialog open data-testid="prazan" />);
    const dialog = screen.getByTestId('prazan') as HTMLDialogElement;
    dialog.tabIndex = -1;
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(event, 'currentTarget', { value: dialog });
    trapModalTab(event as never);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(dialog);
  });

  it('fokus izvan dijaloga se vraća u dijalog', () => {
    mountDialog();
    const dialog = screen.getByTestId('dialog') as HTMLDialogElement;
    const [first, , last] = Array.from(dialog.querySelectorAll('button'));
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    const forward = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(forward, 'currentTarget', { value: dialog });
    trapModalTab(forward as never);
    expect(document.activeElement).toBe(first);

    outside.focus();
    const backward = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    Object.defineProperty(backward, 'currentTarget', { value: dialog });
    trapModalTab(backward as never);
    expect(document.activeElement).toBe(last);
    outside.remove();
  });

  it('skrivene i inertne kontrole se preskaču', () => {
    render(
      <dialog open data-testid="dialog">
        <div inert>
          <button>skriveno</button>
        </div>
        <button tabIndex={-1}>nedostupno</button>
        <button>vidljivo</button>
      </dialog>,
    );
    const dialog = screen.getByTestId('dialog') as HTMLDialogElement;
    const visible = screen.getByRole('button', { name: 'vidljivo' });
    visible.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(event, 'currentTarget', { value: dialog });
    trapModalTab(event as never);
    expect(document.activeElement).toBe(visible);
    fireEvent.keyDown(dialog, { key: 'Tab' });
  });
});
