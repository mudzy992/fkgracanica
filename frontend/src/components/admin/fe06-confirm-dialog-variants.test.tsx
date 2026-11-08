import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

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

describe('ConfirmDialog — varijante (2 grane)', () => {
  it('string description prikazuje text', () => {
    render(<ConfirmDialog open={true} onOpenChange={vi.fn()} title="Potvrdi" onConfirm={vi.fn()} description="Da li ste sigurni?" />);
    expect(screen.getByText('Da li ste sigurni?')).toBeInTheDocument();
  });

  it('element description prikazuje node', () => {
    render(<ConfirmDialog open={true} onOpenChange={vi.fn()} title="Potvrdi" onConfirm={vi.fn()} description={<span>custom</span>} />);
    expect(screen.getByText('custom')).toBeInTheDocument();
  });

  it('confirmLabel fallback koristi prijevod', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open={true} onOpenChange={vi.fn()} title="Potvrdi" onConfirm={onConfirm} />);
    expect(screen.getByText('actions.confirm')).toBeInTheDocument();
  });
});
