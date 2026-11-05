import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MembershipRow } from '../../types/membership';
import { MembershipCardsBulkExport } from './MembershipCardsBulkExport';
import { MembershipCardDownloadActions } from './MembershipCardDownloadActions';

const state = vi.hoisted(() => ({
  settings: {} as Record<string, string>,
  buildCalls: [] as { cards: unknown[]; title: string }[],
  printed: [] as string[],
  downloaded: [] as { filename: string; html: string }[],
}));

vi.mock('../../hooks', () => ({ usePublicSettings: () => ({ data: state.settings }) }));
vi.mock('../../lib/membership-card-document', () => ({
  buildMembershipCardsHtml: async (cards: unknown[], title: string) => {
    state.buildCalls.push({ cards, title });
    return '<html>kartice</html>';
  },
}));
vi.mock('../../lib/pass-print', () => ({
  openPrintHtml: (html: string) => state.printed.push(html),
  downloadHtml: (filename: string, html: string) => state.downloaded.push({ filename, html }),
}));

const withCard = (over: Partial<MembershipRow> = {}): MembershipRow => ({
  id: 'm1',
  status: 'ACTIVE',
  endDate: '2026-12-31T00:00:00.000Z',
  user: { id: 'u1', email: 'ana@mail.ba', firstName: 'Ana', lastName: 'Anić' },
  card: { id: 'c1', cardNumber: 'CG 2026 001', qrCode: 'qr-1', issuedAt: '2026-01-01' },
  ...over,
});

describe('MembershipCardsBulkExport', () => {
  beforeEach(() => {
    state.settings = { 'club.name': 'FK Gračanica' };
    state.buildCalls = [];
    state.printed = [];
    state.downloaded = [];
  });

  it('bez kartica su oba dugmeta onemogućena i broj je nula', () => {
    render(<MembershipCardsBulkExport memberships={[withCard({ card: null })]} />);
    const print = screen.getByRole('button', { name: /Print kartice \(0\)/ });
    expect(print).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: /HTML export \(0\)/ })).toHaveProperty('disabled', true);
  });

  it('disabled prop gasi dugmad i kad kartica ima', () => {
    render(<MembershipCardsBulkExport memberships={[withCard()]} disabled />);
    expect(screen.getByRole('button', { name: /Print kartice \(1\)/ })).toHaveProperty('disabled', true);
  });

  it('print priprema podatke kartica i otvara štampu', async () => {
    render(<MembershipCardsBulkExport memberships={[withCard(), withCard({ id: 'm2', card: null })]} />);
    await userEvent.click(screen.getByRole('button', { name: /Print kartice \(1\)/ }));
    await waitFor(() => expect(state.printed).toEqual(['<html>kartice</html>']));
    const [call] = state.buildCalls;
    expect(call.title).toBe('Članske kartice — FK Gračanica');
    expect(call.cards).toEqual([
      expect.objectContaining({
        memberName: 'Ana Anić',
        clubName: 'FK Gračanica',
        cardNumber: 'CG 2026 001',
        status: 'ACTIVE',
        qrValue: 'qr-1',
      }),
    ]);
  });

  it('HTML export preuzima fajl sa vremenskom oznakom', async () => {
    render(<MembershipCardsBulkExport memberships={[withCard()]} />);
    await userEvent.click(screen.getByRole('button', { name: /HTML export \(1\)/ }));
    await waitFor(() => expect(state.downloaded).toHaveLength(1));
    expect(state.downloaded[0].filename).toMatch(/^clanske-kartice-\d+\.html$/);
    expect(state.downloaded[0].html).toBe('<html>kartice</html>');
  });

  it('bez naziva kluba koristi podrazumijevani naziv', async () => {
    state.settings = {};
    render(<MembershipCardsBulkExport memberships={[withCard()]} />);
    await userEvent.click(screen.getByRole('button', { name: /Print kartice \(1\)/ }));
    await waitFor(() => expect(state.buildCalls).toHaveLength(1));
    expect(state.buildCalls[0].title).toBe('Članske kartice — FK Gračanica');
  });
});

describe('MembershipCardDownloadActions', () => {
  const data = {
    memberName: 'Ana Anić',
    clubName: 'FK Gračanica',
    cardNumber: 'CG 2026 001',
    status: 'ACTIVE',
    validUntil: '31.12.2026',
    qrValue: 'qr-1',
  };

  beforeEach(() => {
    state.buildCalls = [];
    state.printed = [];
    state.downloaded = [];
  });

  it('print otvara dokument jedne kartice', async () => {
    render(<MembershipCardDownloadActions data={data} />);
    await userEvent.click(screen.getByRole('button', { name: 'Print' }));
    await waitFor(() => expect(state.printed).toEqual(['<html>kartice</html>']));
    expect(state.buildCalls[0].title).toBe('Članska kartica — Ana Anić');
  });

  it('preuzimanje koristi broj kartice u nazivu fajla bez razmaka', async () => {
    render(<MembershipCardDownloadActions data={data} />);
    await userEvent.click(screen.getByRole('button', { name: 'Preuzmi HTML' }));
    await waitFor(() => expect(state.downloaded).toHaveLength(1));
    expect(state.downloaded[0].filename).toBe('clanska-kartica-CG-2026-001.html');
  });

  it('disabled prop gasi oba dugmeta', () => {
    render(<MembershipCardDownloadActions data={data} disabled />);
    expect(screen.getByRole('button', { name: 'Print' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Preuzmi HTML' })).toHaveProperty('disabled', true);
  });
});
