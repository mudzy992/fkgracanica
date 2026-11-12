import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TicketingCardBackgroundField } from './ticketing/TicketingCardBackgroundField';
import { AccountSectionTabs } from '../../components/account/AccountSectionTabs';
import { MembershipPendingStatus } from '../../components/membership/MembershipPendingStatus';

const state = vi.hoisted(() => ({
  settings: { 'club.name': 'FK Gračanica' } as Record<string, string> | undefined,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../hooks', () => ({ usePublicSettings: () => ({ data: state.settings }) }));
vi.mock('../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ label, value }: { label: string; value: string | null }) => (
    <div data-testid="picker">
      {label}|{value ?? 'prazno'}
    </div>
  ),
}));
vi.mock('../../components/ticketing/SportEventTicket', () => ({
  SportEventTicket: ({ data }: { data: Record<string, unknown> }) => (
    <div data-testid="ticket">{String(data.clubName)}|{String(data.status)}|{String(data.qrValue)}</div>
  ),
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('TicketingCardBackgroundField', () => {
  it('prikazuje picker, uputu i preview kartice', () => {
    state.settings = { 'club.name': 'FK Gračanica', 'club.crestUrl': '/crest.png' };
    wrap(<TicketingCardBackgroundField value="" onChange={vi.fn()} />);
    expect(screen.getByTestId('picker').textContent).toBe('t:admin.ticketBackground.label|prazno');
    expect(screen.getByText(/landscape, min\. 1200×800/)).toBeInTheDocument();
    expect(screen.getByTestId('ticket').textContent).toBe('FK Gračanica|PAID_AT_BOX_OFFICE|undefined');
  });

  it('bez postavki koristi zadano ime kluba i prosljeđuje pozadinu', () => {
    state.settings = undefined;
    wrap(<TicketingCardBackgroundField value="media/bg.jpg" onChange={vi.fn()} />);
    expect(screen.getByTestId('picker').textContent).toContain('media/bg.jpg');
    expect(screen.getByTestId('ticket').textContent).toContain('FK Gračanica');
  });
});

describe('AccountSectionTabs', () => {
  it('prikazuje oba taba i označava aktivni', () => {
    wrap(<AccountSectionTabs active="membership" onChange={vi.fn()} showTickets />);
    const tabs = screen.getAllByRole('button');
    expect(tabs.map((t) => t.textContent)).toEqual(['Članstvo', 'Ulaznice']);
    expect(tabs[0].className).toContain('bg-primary');
    expect(tabs[1].className).toContain('text-text-muted');
  });

  it('bez ulaznica prikazuje samo članstvo', () => {
    wrap(<AccountSectionTabs active="tickets" onChange={vi.fn()} showTickets={false} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('klik emituje promjenu taba', () => {
    const onChange = vi.fn();
    wrap(<AccountSectionTabs active="membership" onChange={onChange} showTickets />);
    screen.getAllByRole('button')[1].click();
    expect(onChange).toHaveBeenCalledWith('tickets');
  });
});

describe('MembershipPendingStatus', () => {
  it('sa online uplatom prikazuje odgovarajuću poruku', () => {
    wrap(<MembershipPendingStatus onlineAllowed userEmail="a@b.c" />);
    expect(screen.getByText('Na čekanju')).toBeInTheDocument();
    expect(screen.getByText(/Dovršite online uplatu/)).toBeInTheDocument();
    expect(document.body.textContent).toContain('a@b.c');
  });

  it('bez online uplate upućuje na blagajnu', () => {
    wrap(<MembershipPendingStatus onlineAllowed={false} />);
    expect(screen.getByText(/uplate na blagajni stadiona/)).toBeInTheDocument();
    expect(screen.queryByText(/Prijavljeni ste kao/)).toBeNull();
  });
});
