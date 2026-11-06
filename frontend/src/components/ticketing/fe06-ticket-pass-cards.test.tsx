import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketPassCard } from './TicketPassCard';
import { TicketDigitalPass, sampleTicketPreviewData } from './TicketDigitalPass';
import { TicketPassDownloadActions } from './TicketPassDownloadActions';
import { SportEventTicket } from './SportEventTicket';

const state = vi.hoisted(() => ({
  settings: { data: undefined as unknown },
  config: { data: undefined as unknown },
  print: vi.fn(),
  download: vi.fn(),
  qr: [] as string[],
  ticketHtml: vi.fn(async () => '<html>ticket</html>'),
}));

const ticket = (over: Record<string, unknown> = {}) =>
  ({
    id: 'ABCDEF12345678',
    status: 'PAID_AT_BOX_OFFICE',
    category: 'Tribina',
    price: 10,
    qrCode: 'qr-1',
    match: {
      id: 'm1',
      scheduledAt: '2026-05-01T17:00:00.000Z',
      homeClub: { name: 'FK Gračanica', crestPath: 'originals/c1.png' },
      awayClub: { name: 'FK Slavija', crestPath: null },
      competition: { name: 'Premijer liga' },
      season: { name: '2025/26' },
      round: { name: '12. kolo' },
    },
    ...over,
  }) as never;

vi.mock('../../hooks', () => ({ usePublicSettings: () => state.settings }));
vi.mock('../../hooks/use-ticketing', () => ({ useTicketingPublicConfig: () => state.config }));
vi.mock('../pass/PassQrCode', () => ({
  PassQrCode: ({ value }: { value: string }) => {
    state.qr.push(value);
    return <div data-testid="pass-qr" data-value={value} />;
  },
}));
vi.mock('../../lib/pass-print', () => ({
  downloadHtml: (name: string, html: string) => state.download(name, html),
  openPrintHtml: (html: string) => state.print(html),
}));
vi.mock('../../lib/ticket-pass-document', () => ({
  buildTicketPassesHtml: (...a: unknown[]) => state.ticketHtml(...(a as [])),
}));

describe('SportEventTicket', () => {
  it('prikazuje podatke o ulaznici i QR kod', () => {
    render(<SportEventTicket data={sampleTicketPreviewData('FK Gračanica', 'originals/crest.png', 'originals/bg.jpg')} />);
    expect(screen.getAllByText('FK Gračanica').length).toBeGreaterThan(0);
    expect(screen.getByText('Tribina')).toBeTruthy();
    expect(screen.getByText('5 KM')).toBeTruthy();
    expect(screen.getByText('#DEMO0001')).toBeTruthy();
    expect(screen.getByText(/Premijer liga|Prva liga/)).toBeTruthy();
    expect(screen.getByTestId('pass-qr').getAttribute('data-value')).toBe('preview-ticket-qr');
  });

  it('bez pozadine i grbova koristi gradijent i inicijale', () => {
    render(
      <SportEventTicket
        data={{
          clubName: 'FK Gračanica',
          matchTitle: 'Utakmica',
          matchDate: '01.05.2026',
          category: 'Tribina',
          price: '10',
          status: 'RESERVED',
          cancelled: true,
        }}
      />,
    );
    expect(screen.getAllByText('Otkazano').length).toBeGreaterThan(0);
    expect(screen.getAllByText('?')).toHaveLength(2);
    expect(screen.queryByTestId('pass-qr')).toBeNull();
  });

  it('bez metapodataka nema reda sa takmičenjem', () => {
    render(
      <SportEventTicket
        data={{
          clubName: 'Klub',
          matchTitle: 'Utakmica',
          matchDate: '01.05.2026',
          category: 'Tribina',
          price: '10',
          status: 'USED',
        }}
      />,
    );
    expect(screen.queryByText('#')).toBeNull();
  });
});

describe('toTicketPassData / TicketDigitalPass', () => {
  it('priprema podatke za štampu iz ulaznice', () => {
    const { container } = render(<TicketDigitalPass data={sampleTicketPreviewData('FK Gračanica')} />);
    expect(container.textContent).toContain('FK Gračanica');
  });

  it('sample preview ima demo referencu', () => {
    expect(sampleTicketPreviewData('Klub').ticketRef).toBe('DEMO0001');
    expect(sampleTicketPreviewData('Klub').qrValue).toBe('preview-ticket-qr');
  });
});

describe('TicketPassDownloadActions', () => {
  beforeEach(() => {
    state.print = vi.fn();
    state.download = vi.fn();
  });

  const data = () => sampleTicketPreviewData('FK Gračanica');

  it('print otvara HTML dokument', async () => {
    render(<TicketPassDownloadActions data={data()} />);
    await userEvent.click(screen.getByRole('button', { name: /Print/ }));
    await waitFor(() => expect(state.print).toHaveBeenCalledWith('<html>ticket</html>'));
  });

  it('preuzimanje koristi sigurno ime fajla', async () => {
    render(<TicketPassDownloadActions data={data()} />);
    await userEvent.click(screen.getByRole('button', { name: /Preuzmi HTML/ }));
    await waitFor(() => expect(state.download).toHaveBeenCalled());
    expect(String(state.download.mock.calls[0][0])).toMatch(/^ulaznica-.*\.html$/);
  });

  it('disabled blokira oba dugmeta', () => {
    render(<TicketPassDownloadActions data={data()} disabled />);
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  it('prazan naslov daje rezervno ime fajla', async () => {
    render(<TicketPassDownloadActions data={{ ...data(), matchTitle: '' }} />);
    await userEvent.click(screen.getByRole('button', { name: /Preuzmi HTML/ }));
    await waitFor(() => expect(state.download).toHaveBeenCalledWith('ulaznica-utakmica.html', expect.any(String)));
  });
});

describe('TicketPassCard', () => {
  beforeEach(() => {
    state.settings = { data: undefined };
    state.config = { data: undefined };
    state.qr = [];
  });

  it('plaćena ulaznica nudi preuzimanje i QR', () => {
    render(<TicketPassCard ticket={ticket()} />);
    expect(screen.getByRole('button', { name: /Print/ })).toBeTruthy();
    expect(screen.getByTestId('pass-qr').getAttribute('data-value')).toBe('qr-1');
    expect(screen.queryByText(/Rezervacija/)).toBeNull();
  });

  it('rezervisana ulaznica prikazuje napomenu bez QR-a', () => {
    render(<TicketPassCard ticket={ticket({ status: 'RESERVED' })} />);
    expect(screen.getByText(/Rezervacija/)).toBeTruthy();
    expect(screen.queryByTestId('pass-qr')).toBeNull();
    expect(screen.queryByRole('button', { name: /Print/ })).toBeNull();
  });

  it('iskorištena ulaznica prikazuje napomenu', () => {
    render(<TicketPassCard ticket={ticket({ status: 'USED' })} />);
    expect(screen.getByText(/već iskorištena/)).toBeTruthy();
  });

  it('otkazana ulaznica prikazuje pečat Otkazano', () => {
    render(<TicketPassCard ticket={ticket({ status: 'CANCELLED' })} />);
    expect(screen.getAllByText('Otkazano').length).toBeGreaterThan(0);
  });

  it('koristi naziv kluba i pozadinu iz postavki', () => {
    state.settings = { data: { 'club.name': 'FK Test', 'club.crestUrl': 'originals/crest.png' } };
    state.config = { data: { ticketCardBackground: 'originals/bg.jpg' } };
    const { container } = render(<TicketPassCard ticket={ticket()} orderActions={<span>akcije</span>} />);
    expect(container.textContent).toContain('FK Test');
    expect(container.textContent).toContain('akcije');
  });
});
