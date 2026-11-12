import { useLayoutEffect, type KeyboardEvent, type RefObject } from 'react';

let locks = 0;
let previousOverflow = '';

/** Više složenih modala ne smije otključati scroll dok je neki još otvoren. */
export function useBodyScrollLock(open: boolean) {
  useLayoutEffect(() => {
    if (!open) return;
    if (locks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (--locks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [open]);
}

/** Nativni modal izoluje ostatak dokumenta; cleanup vraća fokus otvaraču. */
export function useNativeModal(ref: RefObject<HTMLDialogElement | null>, open: boolean) {
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-modal-initial-focus]')?.focus();
    return () => {
      if (dialog.open) dialog.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, ref]);
}

const focusable = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Drži i Tab/Shift+Tab u aktivnom modalu, uključujući dinamičke kontrole. */
export function trapModalTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return;
  const dialog = event.currentTarget;
  const elements = Array.from(dialog.querySelectorAll<HTMLElement>(focusable)).filter(
    (el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && !el.closest('[inert], [aria-hidden="true"]'),
  );
  const first = elements[0];
  const last = elements.at(-1);
  if (!first || !last) {
    event.preventDefault();
    dialog.focus();
  } else if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
}
