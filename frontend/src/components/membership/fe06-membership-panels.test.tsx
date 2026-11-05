import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MembershipRow } from '../../types/membership';
import { MembershipInactivePanel } from './MembershipInactivePanel';
import { MembershipCardPanel } from './MembershipCardPanel';
import { MembershipDigitalCard } from './MembershipDigitalCard';

const state = vi.hoisted(() => ({
  settings: {} as Record<string, string>,
  user: null as { id: string; email: string; firstName?: string; lastName?: string } | null,
  paid: [] as string[],
  rejoin: 0,
}));

vi.mock('../../hooks', () => ({ usePublicSettings: () => ({ data: state.settings }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('../pass/PassQrCode', () => ({
  PassQrCode: ({ value, label }: { value: string; label?: string }) => (
    <div data-testid="qr">{`${label}:${value}`}</div>
  ),
}));
vi.mock('../../lib/pass-print', () => ({
  openPrintHtml: vi.fn(),
  downloadHtml: vi.fn(),
}));

const renderInactive = (over: Partial<React.ComponentProps<typeof MembershipInactivePanel>> = {}) =>
  render(
    <MemoryRouter>
      <MembershipInactivePanel
        current={{ id: 'm1', status: 'EXPIRED' }}
        onlineAllowed={false}
        annualPrice={50}
        providers={['stripe']}
        busy={false}
        onPay={(provider) => state.paid.push(provider)}
        onRejoin={() => { state.rejoin += 1; }}
        {...over}
      />
    </MemoryRouter>,
  );

describe('MembershipInactivePanel', () => {
  beforeEach(() => {
    state.paid = [];
    state.rejoin = 0;
  });

  it('suspendovano članstvo upućuje na kontakt formu', () => {
    renderInactive({ current: { id: 'm1', status: 'SUSPENDED' } });
    expect(screen.getByText(/Vaše članstvo je suspendovano\./)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'kontakt forme' }).getAttribute('href')).toBe('/kontakt');
  });

  it('isteklo članstvo uz online plaćanje nudi obnovu', async () => {
    renderInactive({ onlineAllowed: true });
    expect(screen.getByText('Članstvo je isteklo. Obnovite ga online.')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Plati online' }));
    expect(state.paid).toEqual(['stripe']);
  });

  it('više provajdera prikazuje dugme po provajderu', async () => {
    renderInactive({ onlineAllowed: true, providers: ['stripe', 'paypal'] });
    await userEvent.click(screen.getByRole('button', { name: 'Plati putem PayPal' }));
    expect(state.paid).toEqual(['paypal']);
  });

  it('otkazano članstvo nudi ponovno učlanjenje online', () => {
    renderInactive({ onlineAllowed: true, current: { id: 'm1', status: 'CANCELLED' } });
    expect(screen.getByText('Članstvo je otkazano. Možete se ponovo učlaniti online.')).toBeTruthy();
  });

  it('bez online plaćanja prikazuje informacije o blagajni i dugme za ponovnu prijavu', async () => {
    renderInactive();
    expect(screen.getByText('Online kupovina članstva trenutno nije omogućena')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Prijavi se ponovo' }));
    expect(state.rejoin).toBe(1);
  });

  it('greška registracije i stanje obrade mijenjaju prikaz dugmeta', () => {
    renderInactive({ busy: true, registerError: true });
    expect(screen.getByRole('button', { name: 'Obrada...' })).toHaveProperty('disabled', true);
    expect(
      screen.getByText('Prijava nije uspjela. Pokušajte ponovo ili kontaktirajte klub.'),
    ).toBeTruthy();
  });

  it('nulta cijena gasi online opciju iako je dozvoljena', () => {
    renderInactive({ onlineAllowed: true, annualPrice: 0 });
    expect(screen.getByText('Online kupovina članstva trenutno nije omogućena')).toBeTruthy();
  });
});

describe('MembershipCardPanel / MembershipDigitalCard', () => {
  const membership = (over: Partial<MembershipRow> = {}): MembershipRow => ({
    id: 'm1',
    status: 'ACTIVE',
    endDate: '2026-12-31T00:00:00.000Z',
    card: { id: 'c1', cardNumber: 'CG-1', qrCode: 'qr-9', issuedAt: '2026-01-01' },
    ...over,
  });

  beforeEach(() => {
    state.settings = { 'club.name': 'FK Gračanica' };
    state.user = null;
  });

  it('bez kartice ne renderuje ništa', () => {
    const { container } = render(
      <MemoryRouter>
        <MembershipCardPanel membership={membership({ card: null })} />
      </MemoryRouter>,
    );
    expect(container.textContent).toBe('');
  });

  it('sa karticom prikazuje broj, status, ime iz članstva i QR', () => {
    render(
      <MemoryRouter>
        <MembershipCardPanel
          membership={membership({ user: { id: 'u1', email: 'x@mail.ba', firstName: 'Ana', lastName: 'Anić' } })}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('CG-1')).toBeTruthy();
    expect(screen.getByText('Aktivno')).toBeTruthy();
    expect(screen.getByText('Ana Anić')).toBeTruthy();
    expect(screen.getByTestId('qr').textContent).toBe('QR članske kartice:qr-9');
    expect(screen.getByRole('button', { name: 'Print' })).toBeTruthy();
  });

  it('bez korisnika u članstvu koristi prijavljenog korisnika', () => {
    state.user = { id: 'u2', email: 'prijavljeni@mail.ba' };
    render(
      <MemoryRouter>
        <MembershipCardPanel membership={membership()} />
      </MemoryRouter>,
    );
    expect(screen.getByText('prijavljeni@mail.ba')).toBeTruthy();
  });

  it('kartica bez QR koda ne prikazuje QR blok i koristi crticu za datum', () => {
    render(
      <MembershipDigitalCard
        data={{
          memberName: 'Bez Datuma',
          clubName: 'FK Gračanica',
          cardNumber: 'CG-2',
          status: 'PENDING',
          validUntil: '—',
          qrValue: '',
        }}
      />,
    );
    expect(screen.getByText('Na čekanju')).toBeTruthy();
    expect(screen.queryByTestId('qr')).toBeNull();
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('FK')).toBeTruthy();
  });
});
