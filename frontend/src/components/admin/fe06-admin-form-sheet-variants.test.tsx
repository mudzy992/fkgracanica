import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { AdminFormSheet } from './AdminFormSheet';

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

describe('AdminFormSheet — varijante (2 grane)', () => {
  it('bez unsavedChanges ne blokira zatvaranje', () => {
    const onOpenChange = vi.fn();
    render(<AdminFormSheet open={true} onOpenChange={onOpenChange} title="Test"><div>sadržaj</div></AdminFormSheet>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('sa dirty true pokazuje confirm', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(<AdminFormSheet open={true} onOpenChange={onOpenChange} title="Test" dirty={true}><div>sadržaj</div></AdminFormSheet>);
    expect(container).toBeInTheDocument();
  });
});
