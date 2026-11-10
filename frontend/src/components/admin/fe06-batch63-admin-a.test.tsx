import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { AdminFormSheet } from './AdminFormSheet';
import { ConfirmDialog } from './ConfirmDialog';
import { FormationSlotPanel } from './formation/FormationSlotPanel';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

// jsdom nema <dialog> showModal/close — stub kao u ostalim FE06 testovima
HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
}) as unknown as typeof HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open');
}) as unknown as typeof HTMLDialogElement.prototype.close;

describe('batch63 admin a', () => {
  afterEach(() => cleanup());
  it('AdminFormSheet contains false branch', async () => {
    const onOpenChange = vi.fn();
    render(
      <AdminFormSheet open={true} onOpenChange={onOpenChange} title="Test">
        <input defaultValue="a" />
      </AdminFormSheet>,
    );
    const input = screen.getByDisplayValue('a') as HTMLInputElement;
    expect(input).toBeTruthy();
    const spy = vi.spyOn(Element.prototype, 'contains').mockReturnValueOnce(false);
    fireEvent.focus(input);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    fireEvent.input(input, { target: { value: 'c' } });
    expect((screen.getByDisplayValue('c') as HTMLInputElement).value).toBe('c');
  });

  it('ConfirmDialog isPending true and fallback', async () => {
    const { unmount } = render(
      <ConfirmDialog open={true} onOpenChange={vi.fn()} title="T" confirmLabel="OK" isPending={true} onConfirm={vi.fn()} />,
    );
    expect(document.body.textContent).toContain('...');
    unmount();
    cleanup();
    const { unmount: u2 } = render(
      <ConfirmDialog open={true} onOpenChange={vi.fn()} title="T" confirmLabel="Custom" isPending={false} onConfirm={vi.fn()} />,
    );
    expect(document.body.textContent).toContain('Custom');
    u2();
    cleanup();
    render(
      <ConfirmDialog open={true} onOpenChange={vi.fn()} title="T" isPending={false} onConfirm={vi.fn()} />,
    );
    expect(document.body.textContent).toContain('actions.confirm');
  });

  it('FormationSlotPanel number falsy and truthy', async () => {
    const slot: any = { id: 's1', isBench: false, playerId: null, player: null };
    const players: any = [{ id: 'p1', firstName: 'A', lastName: 'B', number: null }];
    const { container } = render(<FormationSlotPanel slot={slot} players={players} onPick={vi.fn()} onRemove={vi.fn()} onClose={vi.fn()} />);
    expect(container.textContent).toContain('A B');
    expect(container.textContent).not.toContain('7');
    const players2: any = [{ id: 'p2', firstName: 'C', lastName: 'D', number: 7 }];
    const { container: c2 } = render(<FormationSlotPanel slot={slot} players={players2} onPick={vi.fn()} onRemove={vi.fn()} onClose={vi.fn()} />);
    expect(c2.textContent).toContain('7');
  });
});
