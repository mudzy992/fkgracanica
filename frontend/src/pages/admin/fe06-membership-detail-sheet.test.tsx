import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipDetailSheet } from './MembershipDetailSheet';

const state = vi.hoisted(() => ({
  detail: { data: undefined as unknown, id: undefined as string | undefined } as { data: unknown; id?: string },
  settings: { data: undefined as unknown },
  cardMembership: [] as unknown[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-membership', () => ({
  useMembershipDetail: (id?: string) => {
    state.detail = { ...state.detail, id };
    return state.detail;
  },
}));
vi.mock('../../hooks', () => ({ usePublicSettings: () => state.settings }));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open ? <section aria-label={title}>{children}</section> : null,
}));
vi.mock('../../components/membership/MembershipCardPanel', () => ({
  MembershipCardPanel: ({ membership }: { membership: { card?: string } }) => {
    state.cardMembership.push(membership);
    return <div data-testid="card-panel">kartica:{membership.card}</div>;
  },
}));

const membership = (over: Record<string, unknown> = {}) => ({
  id: 'ms1',
  status: 'ACTIVE',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T00:00:00.000Z',
  createdAt: '2025-12-20T08:15:00.000Z',
  card: null,
  user: { firstName: 'Amar', lastName: 'Hodžić', email: 'amar@example.com' },
  ...over,
});

describe('MembershipDetailSheet', () => {
  beforeEach(() => {
    state.detail = { data: undefined };
    state.settings = { data: undefined };
    state.cardMembership = [];
  });

  it('bez članstva ne prikazuje ništa', () => {
    const { container } = render(
      <MembershipDetailSheet membership={null} open onOpenChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('zatvoren sheet ne prikazuje sadržaj', () => {
    render(
      <MembershipDetailSheet membership={membership() as never} open={false} onOpenChange={() => {}} />,
    );
    expect(screen.queryByLabelText('admin.membershipForm.detail')).toBeNull();
  });

  it('prikazuje člana, email, status i datume', () => {
    render(
      <MembershipDetailSheet membership={membership() as never} open onOpenChange={() => {}} />,
    );
    expect(screen.getByText('Amar Hodžić')).toBeTruthy();
    expect(screen.getByText('amar@example.com')).toBeTruthy();
    expect(screen.getByText('Aktivno')).toBeTruthy();
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
  });

  it('detalj sa servera ima prednost nad redom iz liste', () => {
    state.detail = { data: membership({ status: 'PENDING', user: { firstName: 'Novi', lastName: 'Član' } }) };
    render(
      <MembershipDetailSheet membership={membership() as never} open onOpenChange={() => {}} />,
    );
    expect(screen.getByText('Novi Član')).toBeTruthy();
    expect(screen.getByText('Na čekanju')).toBeTruthy();
  });

  it('bez datuma i emaila prikazuje crtice', () => {
    state.detail = {
      data: membership({ startDate: null, endDate: null, createdAt: null, user: { firstName: 'X', lastName: 'Y' } }),
    };
    render(
      <MembershipDetailSheet membership={membership() as never} open onOpenChange={() => {}} />,
    );
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText('admin.membershipForm.created')).toBeNull();
  });

  it('kartica se prikazuje samo kad članstvo ima card', () => {
    const { rerender } = render(
      <MembershipDetailSheet membership={membership() as never} open onOpenChange={() => {}} />,
    );
    expect(screen.queryByTestId('card-panel')).toBeNull();
    state.detail = { data: membership({ card: 'K-2026' }) };
    rerender(
      <MembershipDetailSheet membership={membership() as never} open onOpenChange={() => {}} />,
    );
    expect(screen.getByTestId('card-panel').textContent).toBe('kartica:K-2026');
    expect(state.cardMembership.at(-1)).toEqual(expect.objectContaining({ card: 'K-2026' }));
  });

  it('ime kluba iz postavki se prikazuje kad postoji', () => {
    const { rerender } = render(
      <MembershipDetailSheet membership={membership() as never} open onOpenChange={() => {}} />,
    );
    expect(screen.queryByText('admin.membershipForm.club')).toBeNull();
    state.settings = { data: { 'club.name': 'FK Gračanica' } };
    rerender(
      <MembershipDetailSheet membership={membership() as never} open onOpenChange={() => {}} />,
    );
    expect(screen.getByText('admin.membershipForm.club')).toBeTruthy();
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
  });

  it('detalj bez korisnika prikazuje crticu za ime i email', () => {
    state.detail = { data: membership({ user: undefined }) };
    render(
      <MembershipDetailSheet membership={membership() as never} open onOpenChange={() => {}} />,
    );
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});
