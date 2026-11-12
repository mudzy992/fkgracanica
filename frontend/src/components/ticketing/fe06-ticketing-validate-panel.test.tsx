import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketingValidatePanel } from './TicketingValidatePanel';

const state = vi.hoisted(() => ({
  config: { data: undefined as unknown },
  validate: {
    mutateAsync: vi.fn(async () => ({})),
    isPending: false,
    data: undefined as unknown,
  },
}));

vi.mock('../../hooks/use-ticketing', () => ({ useTicketingPublicConfig: () => state.config }));
vi.mock('../../hooks/use-ticketing-admin', () => ({ useValidateTicket: () => state.validate }));

const QR = 'QR kod ulaznice';

describe('TicketingValidatePanel', () => {
  beforeEach(() => {
    state.config = { data: undefined };
    state.validate = { mutateAsync: vi.fn(async () => ({})), isPending: false, data: undefined };
  });

  it('prikazuje naslov i opis bez aktivne utakmice', () => {
    render(<TicketingValidatePanel />);
    expect(screen.getByRole('heading', { name: 'Validacija na ulazu' })).toBeTruthy();
    expect(screen.getByText(/Skenirajte QR ulaznice/)).toBeTruthy();
    expect(screen.queryByText(/utakmica:/)).toBeNull();
  });

  it('sa aktivnom utakmicom prikazuje par klubova', () => {
    state.config = {
      data: {
        activeTicketMatch: {
          id: 'm1',
          homeClub: { name: 'FK Gračanica' },
          awayClub: { name: 'FK Slavija' },
        },
      },
    };
    render(<TicketingValidatePanel />);
    expect(screen.getByText(/utakmica: FK Gračanica vs FK Slavija/)).toBeTruthy();
  });

  it('nedostajući nazivi klubova padaju na crticu', () => {
    state.config = { data: { activeTicketMatch: { id: 'm1' } } };
    render(<TicketingValidatePanel />);
    expect(screen.getByText(/utakmica: — vs —/)).toBeTruthy();
  });

  it('prazan kod ne pokreće validaciju', async () => {
    render(<TicketingValidatePanel />);
    await userEvent.click(screen.getByRole('button', { name: 'Validiraj' }));
    expect(state.validate.mutateAsync).not.toHaveBeenCalled();
  });

  it('kod od samih razmaka ne pokreće validaciju', async () => {
    render(<TicketingValidatePanel />);
    await userEvent.type(screen.getByPlaceholderText(QR), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Validiraj' }));
    expect(state.validate.mutateAsync).not.toHaveBeenCalled();
  });

  it('validacija šalje trimovan kod i ID aktivne utakmice', async () => {
    state.config = { data: { activeTicketMatch: { id: 'm7' } } };
    render(<TicketingValidatePanel />);
    await userEvent.type(screen.getByPlaceholderText(QR), '  ABC-123  ');
    await userEvent.click(screen.getByRole('button', { name: 'Validiraj' }));
    expect(state.validate.mutateAsync).toHaveBeenCalledWith({ qrCode: 'ABC-123', matchId: 'm7' });
  });

  it('uspješna validacija prikazuje status, kategoriju i utakmicu', () => {
    state.validate = {
      mutateAsync: vi.fn(async () => ({})),
      isPending: false,
      data: {
        status: 'ADMITTED',
        category: 'VIP',
        match: { homeClub: { name: 'FK Gračanica' }, awayClub: { name: 'FK Slavija' } },
      },
    };
    render(<TicketingValidatePanel />);
    expect(
      screen.getByText('Valjano — Ulaz odobren · VIP · FK Gračanica vs FK Slavija'),
    ).toBeTruthy();
  });

  it('greška „iskorišteno“ dobija odgovarajući prefiks', async () => {
    state.validate = {
      mutateAsync: vi.fn(async () => {
        throw new Error('Ulaznica je već iskorištena.');
      }),
      isPending: false,
      data: undefined,
    };
    render(<TicketingValidatePanel />);
    await userEvent.type(screen.getByPlaceholderText(QR), 'X1');
    await userEvent.click(screen.getByRole('button', { name: 'Validiraj' }));
    expect(await screen.findByText(/Iskorišteno — Ulaznica je već iskorištena\./)).toBeTruthy();
  });

  it('ostale greške dobijaju prefiks „Nevažeće“', async () => {
    state.validate = {
      mutateAsync: vi.fn(async () => {
        throw new Error('Kod nije pronađen.');
      }),
      isPending: false,
      data: undefined,
    };
    render(<TicketingValidatePanel />);
    await userEvent.type(screen.getByPlaceholderText(QR), 'X2');
    await userEvent.click(screen.getByRole('button', { name: 'Validiraj' }));
    expect(await screen.findByText(/Nevažeće — Kod nije pronađen\./)).toBeTruthy();
  });

  it('greška bez poruke koristi fallback tekst', async () => {
    state.validate = {
      mutateAsync: vi.fn(async () => {
        throw {};
      }),
      isPending: false,
      data: undefined,
    };
    render(<TicketingValidatePanel />);
    await userEvent.type(screen.getByPlaceholderText(QR), 'X3');
    await userEvent.click(screen.getByRole('button', { name: 'Validiraj' }));
    expect(
      await screen.findByText(/Validacija nije uspjela\. Provjerite QR kod i status ulaznice\./),
    ).toBeTruthy();
  });

  it('tokom validacije dugme je onemogućeno i piše „Provjera...“', () => {
    state.validate = { mutateAsync: vi.fn(async () => ({})), isPending: true, data: undefined };
    render(<TicketingValidatePanel />);
    expect(screen.getByRole('button', { name: 'Provjera...' })).toHaveProperty('disabled', true);
  });

  it('uspješan rezultat se ne prikazuje ako postoji greška', async () => {
    state.validate = {
      mutateAsync: vi.fn(async () => {
        throw new Error('Greška');
      }),
      isPending: false,
      data: { status: 'ADMITTED', category: 'VIP', match: undefined },
    };
    render(<TicketingValidatePanel />);
    await userEvent.type(screen.getByPlaceholderText(QR), 'X4');
    await userEvent.click(screen.getByRole('button', { name: 'Validiraj' }));
    expect(await screen.findByText(/Nevažeće/)).toBeTruthy();
    expect(screen.queryByText(/Valjano —/)).toBeNull();
  });
});
