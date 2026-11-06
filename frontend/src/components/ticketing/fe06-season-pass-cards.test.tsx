import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeasonPassCard } from './SeasonPassCard';
import { SeasonPassVisual } from './SeasonPassVisual';
import { SeasonPassDownloadActions } from './SeasonPassDownloadActions';

const state = vi.hoisted(() => ({
  settings: { data: undefined as unknown },
  print: vi.fn(),
  download: vi.fn(),
  qr: [] as string[],
  seasonHtml: vi.fn(async () => '<html>season</html>'),
}));

vi.mock('../../hooks', () => ({ usePublicSettings: () => state.settings }));
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
vi.mock('../../lib/season-pass-document', () => ({
  buildSeasonPassHtml: (...a: unknown[]) => state.seasonHtml(...(a as [])),
}));

const seasonPass = (over: Record<string, unknown> = {}) => ({
  id: 'PASS00001234567',
  status: 'ACTIVE',
  label: 'Sezonska',
  price: '50',
  qrCode: 'qr-season',
  season: { name: '2025/26' },
  ...over,
});

describe('SeasonPassVisual', () => {
  const visual = (over: Record<string, unknown> = {}) => ({
    clubName: 'FK Gračanica',
    crestUrl: 'originals/crest.png',
    label: 'Sezonska',
    seasonName: '2025/26',
    price: '50',
    status: 'ACTIVE',
    qrValue: 'qr-season',
    ticketRef: 'PASS0001',
    cancelled: false,
    ...over,
  });

  it('aktivna karta prikazuje QR i cijenu', () => {
    render(<SeasonPassVisual data={visual() as never} />);
    expect(screen.getByText('50 KM')).toBeTruthy();
    expect(screen.getByText('#PASS0001')).toBeTruthy();
    expect(screen.getByTestId('pass-qr')).toBeTruthy();
  });

  it('otkazana karta prikazuje pečat bez QR-a', () => {
    render(<SeasonPassVisual data={visual({ cancelled: true, qrValue: undefined }) as never} />);
    expect(screen.getAllByText('Otkazano').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('pass-qr')).toBeNull();
  });
});

describe('SeasonPassDownloadActions', () => {
  beforeEach(() => {
    state.print = vi.fn();
    state.download = vi.fn();
  });

  const data = () => ({
    clubName: 'FK Gračanica',
    label: 'Sezonska',
    seasonName: '2025/26',
    price: '50',
    status: 'ACTIVE',
    qrValue: 'qr',
    ticketRef: 'PASS0001',
    cancelled: false,
  });

  it('preuzimanje koristi referencu u imenu', async () => {
    render(<SeasonPassDownloadActions data={data() as never} />);
    await userEvent.click(screen.getByRole('button', { name: /Preuzmi HTML/ }));
    await waitFor(() =>
      expect(state.download).toHaveBeenCalledWith('sezonska-karta-pass0001.html', '<html>season</html>'),
    );
  });

  it('print otvara HTML sezonske karte', async () => {
    render(<SeasonPassDownloadActions data={data() as never} />);
    await userEvent.click(screen.getByRole('button', { name: /Print/ }));
    await waitFor(() => expect(state.print).toHaveBeenCalledWith('<html>season</html>'));
  });
});

describe('SeasonPassCard', () => {
  beforeEach(() => {
    state.settings = { data: undefined };
    state.qr = [];
  });

  it('aktivna karta prikazuje QR i akcije', () => {
    render(<SeasonPassCard pass={seasonPass() as never} />);
    expect(screen.getByRole('button', { name: /Print/ })).toBeTruthy();
    expect(screen.getByTestId('pass-qr').getAttribute('data-value')).toBe('qr-season');
  });

  it('otkazana karta nema QR ni akcije', () => {
    render(<SeasonPassCard pass={seasonPass({ status: 'CANCELLED' }) as never} />);
    expect(screen.getAllByText('Otkazano').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('pass-qr')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('koristi naziv kluba iz postavki i rezervnu sezonu', () => {
    state.settings = { data: { 'club.name': 'FK Test' } };
    const { container } = render(
      <SeasonPassCard pass={seasonPass({ season: undefined }) as never} />,
    );
    expect(container.textContent).toContain('FK Test');
    expect(container.textContent).toContain('Sezona');
  });
});
