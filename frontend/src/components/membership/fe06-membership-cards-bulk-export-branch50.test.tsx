import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MembershipCardsBulkExport } from './MembershipCardsBulkExport';

const state = vi.hoisted(() => ({
  settings: undefined as unknown as Record<string, string> | undefined,
  buildHtml: vi.fn(async () => '<html>mock</html>'),
  openPrint: vi.fn(),
  download: vi.fn(),
  mediaUrl: vi.fn((url: string) => `thumb:${url}`),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: state.settings }),
}));
vi.mock('../../lib/media', () => ({
  mediaUrl: (u: string, _p: string) => state.mediaUrl(u),
}));
vi.mock('../../lib/membership-card-document', () => ({
  buildMembershipCardsHtml: (...args: unknown[]) => state.buildHtml(...args),
}));
vi.mock('../../lib/pass-print', () => ({
  openPrintHtml: (...args: unknown[]) => state.openPrint(...args),
  downloadHtml: (...args: unknown[]) => state.download(...args),
}));
vi.mock('../../lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../lib/utils')>('../../lib/utils');
  return { ...actual, formatDate: (s: string) => `fmt:${s}` };
});
vi.mock('../../lib/membership-status', () => ({
  membershipUserName: (u: { firstName?: string; lastName?: string; email: string }) =>
    [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
}));

const membership = (over: Record<string, unknown> = {}): unknown => ({
  status: 'ACTIVE',
  endDate: '2026-12-31',
  user: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
  card: { cardNumber: '001', qrCode: 'qr-001' },
  ...over,
});

describe('MembershipCardsBulkExport — branch50 (clubName/crest/validUntil/empty/mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.settings = undefined;
  });

  it('clubName fallback i crestUrl undefined (?? i ? : false)', () => {
    state.settings = undefined;
    render(<MembershipCardsBulkExport memberships={[membership() as never]} />);
    // klub fallback se koristi u toPrintData -> provjeri da count 1 i dugmad nisu disabled
    expect(screen.getByText('Print kartice (1)')).toBeInTheDocument();
    expect(screen.getByText('HTML export (1)')).toBeInTheDocument();
  });

  it('crestUrl truthy i endDate null fallback na —', async () => {
    state.settings = { 'club.name': 'FK Test', 'club.crestUrl': '/crest.png' } as never;
    render(
      <MembershipCardsBulkExport
        memberships={[
          membership({ endDate: null, card: { cardNumber: '002', qrCode: 'qr2' } }) as never,
          membership({ card: null } as never) as never, // filter -> bez qrCode, ne ulazi u count
        ]}
      />,
    );
    expect(screen.getByText('Print kartice (1)')).toBeInTheDocument();
    // pokreni print da provjeri mediaUrl poziv sa crestUrl
    fireEvent.click(screen.getByText('Print kartice (1)'));
    await waitFor(() => expect(state.buildHtml).toHaveBeenCalled());
    expect(state.mediaUrl).toHaveBeenCalledWith('/crest.png');
    expect(state.openPrint).toHaveBeenCalledWith('<html>mock</html>');
  });

  it('prazan memberships -> count 0 i run early return (!cards.length)', async () => {
    render(<MembershipCardsBulkExport memberships={[]} />);
    expect(screen.getByText('Print kartice (0)')).toBeInTheDocument();
    const btn = screen.getByText('Print kartice (0)').closest('button')!;
    expect(btn).toBeDisabled();
    // i kad je disabled, onClick je void run ali ne poziva build
    fireEvent.click(screen.getByText('HTML export (0)'));
    await new Promise((r) => setTimeout(r, 10));
    expect(state.buildHtml).not.toHaveBeenCalled();
  });

  it('download mode poziva downloadHtml (mode !== print)', async () => {
    state.settings = { 'club.name': 'FK Gračanica' } as never;
    render(<MembershipCardsBulkExport memberships={[membership() as never]} />);
    fireEvent.click(screen.getByText('HTML export (1)'));
    await waitFor(() => expect(state.download).toHaveBeenCalled());
    expect(state.download).toHaveBeenCalledWith(expect.stringContaining('clanske-kartice-'), '<html>mock</html>');
  });

  it('disabled prop i busy tokom run-a', async () => {
    render(<MembershipCardsBulkExport memberships={[membership() as never]} disabled />);
    expect(screen.getByText('Print kartice (1)').closest('button')!).toBeDisabled();
  });

  it('busy stanje tokom async run-a', async () => {
    state.buildHtml.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 30));
      return '<html>busy</html>';
    });
    render(<MembershipCardsBulkExport memberships={[membership() as never]} />);
    fireEvent.click(screen.getByText('Print kartice (1)'));
    await waitFor(() => expect(screen.getByText('Print kartice (1)').closest('button')!).toBeDisabled());
    await waitFor(() => expect(state.openPrint).toHaveBeenCalled());
  });
});
