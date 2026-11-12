import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBodyScrollLock, useNativeModal } from './modal-effects';

/**
 * Batch 34 — rubovi zajedničkih modalnih efekata: skrivanje scroll-a sa više
 * slojeva, vraćanje fokusa i Tab-ciklus kad fokus nije na ivici.
 */

/**
 * jsdom (ova verzija) nema `showModal`/`close` na `HTMLDialogElement` —
 * dopunjavamo ih da bi spijevi mogli pratiti pozive.
 */
const dialogProto = HTMLDialogElement.prototype as unknown as {
  showModal?: () => void;
  close?: () => void;
};
dialogProto.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
dialogProto.close ??= function (this: HTMLDialogElement) {
  this.open = false;
};

/** jsdom nema layout — `getClientRects` mora vratiti bar jedan pravougaonik. */
const rect = () => [{ width: 10, height: 10 }] as unknown as DOMRectList;
beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(rect());
  document.body.style.overflow = 'auto';
});

function ScrollLockDemo({ open }: { open: boolean }) {
  useBodyScrollLock(open);
  return <p>sadržaj</p>;
}

describe('useBodyScrollLock', () => {
  it('zaključava scroll dok je otvoren i vraća prethodnu vrijednost', () => {
    const { rerender, unmount } = render(<ScrollLockDemo open />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<ScrollLockDemo open={false} />);
    expect(document.body.style.overflow).toBe('auto');
    unmount();
  });

  it('dva sloja ne otključavaju scroll dok je drugi otvoren', () => {
    const first = render(<ScrollLockDemo open />);
    const second = render(<ScrollLockDemo open />);
    first.rerender(<ScrollLockDemo open={false} />);
    expect(document.body.style.overflow).toBe('hidden');
    second.unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('zatvoren modal ne dira scroll', () => {
    render(<ScrollLockDemo open={false} />);
    expect(document.body.style.overflow).toBe('auto');
  });
});

function NativeModalDemo({
  open,
  openAttr = true,
}: {
  open: boolean;
  openAttr?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useNativeModal(ref, open);
  return (
    <dialog ref={ref} open={openAttr} data-testid="dialog">
      <button data-modal-initial-focus>prvo polje</button>
      <button>drugo polje</button>
    </dialog>
  );
}

describe('useNativeModal', () => {
  it('otvara dijalog, fokusira početno polje i vraća fokus na cleanup', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = true;
    });
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false;
    });
    const { unmount } = render(<NativeModalDemo open />);
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'prvo polje' }));
    unmount();
    expect(close).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('zatvoren dijalog se ne otvara i cleanup ne zove close', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close');
    const { unmount } = render(<NativeModalDemo open={false} />);
    expect(showModal).not.toHaveBeenCalled();
    unmount();
    expect(close).not.toHaveBeenCalled();
  });

  it('cleanup bez otvorenog dijaloga ne zove close', () => {
    // showModal ne postavlja `open`, pa cleanup preskače zatvaranje.
    const showModal = vi
      .spyOn(HTMLDialogElement.prototype, 'showModal')
      .mockImplementation(() => undefined);
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close');
    // Element nema `open`, pa cleanup preskače zatvaranje.
    const { unmount } = render(<NativeModalDemo open openAttr={false} />);
    expect(showModal).toHaveBeenCalledTimes(1);
    unmount();
    expect(close).not.toHaveBeenCalled();
  });

  it('fokus se ne vraća elementu koji je uklonjen iz dokumenta', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = true;
    });
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false;
    });
    const { unmount } = render(<NativeModalDemo open />);
    opener.remove();
    expect(() => unmount()).not.toThrow();
  });

  it('aktivni element koji nije HTMLElement se ne pamti', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement');
    Object.defineProperty(document, 'activeElement', { configurable: true, get: () => null });
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = true;
    });
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false;
    });
    const { unmount } = render(<NativeModalDemo open />);
    expect(showModal).toHaveBeenCalled();
    unmount();
    if (descriptor) Object.defineProperty(document, 'activeElement', descriptor);
  });
});
