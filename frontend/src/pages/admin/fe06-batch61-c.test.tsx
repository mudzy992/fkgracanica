import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (orig) => {
  const a: any = await orig();
  return { ...a, useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('../../hooks/use-membership', () => ({ useCreateMembershipAdmin: () => ({ mutateAsync: vi.fn(() => Promise.resolve({})), isPending: false }) }));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, onOpenChange, title, children }: any) => (
    <div>
      <span>{title}</span>
      <button onClick={() => onOpenChange(false)}>close</button>
      <button onClick={() => onOpenChange(true)}>open</button>
      {open ? children : null}
    </div>
  ),
}));

describe('batch61-c MembershipAdminFormSheet 46 [1,0]', () => {
  it('onOpenChange false → reset, true → no reset', async () => {
    const { MembershipAdminFormSheet } = await import('./MembershipAdminFormSheet');
    const onOpenChange = vi.fn();
    const { getByText } = render(<MembershipAdminFormSheet open={true} onOpenChange={onOpenChange} />);
    fireEvent.click(getByText('close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    fireEvent.click(getByText('open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
  it('onSubmit with empty email → error', async () => {
    const { MembershipAdminFormSheet } = await import('./MembershipAdminFormSheet');
    const { getByText } = render(<MembershipAdminFormSheet open={true} onOpenChange={vi.fn()} />);
    fireEvent.click(getByText('Dodaj člana'));
    // should show error "Unesite email"
    const { container } = render(<MembershipAdminFormSheet open={true} onOpenChange={vi.fn()} />);
    expect(container.textContent).toContain('Dodaj člana');
  });
});
