import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsletterWidget } from './NewsletterWidget';
import { TicketsCtaWidget } from './TicketsCtaWidget';
import { HeroNextMatchBanner } from './hero/HeroNextMatchBanner';

const state = vi.hoisted(() => ({
  subscribe: {
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null as unknown,
  },
  matches: [] as unknown[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../hooks', () => ({
  useSubscribeNewsletter: () => state.subscribe,
  useMatches: () => ({ data: state.matches }),
}));
vi.mock('../../components/ticketing/HomeNextMatchTicketsBanner', () => ({
  HomeNextMatchTicketsBanner: ({ title, text }: { title?: string; text?: string }) => (
    <div data-testid="auto-banner">
      {title}|{text ?? 'bez teksta'}
    </div>
  ),
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

beforeEach(() => {
  state.subscribe = {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    isError: false,
    error: null,
  };
  state.matches = [];
});

describe('NewsletterWidget', () => {
  it('koristi prevedene tekstove kad config nema naslova', () => {
    wrap(<NewsletterWidget config={{}} />);
    expect(screen.getByRole('heading', { name: 't:home.newsletter' })).toBeInTheDocument();
    expect(screen.getByText('t:home.newsletterDesc')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('t:common.email')).toBeInTheDocument();
  });

  it('config naslov i opis imaju prednost', () => {
    wrap(<NewsletterWidget config={{ title: 'Prijava', description: 'Sedmični pregled' }} />);
    expect(screen.getByRole('heading', { name: 'Prijava' })).toBeInTheDocument();
    expect(screen.getByText('Sedmični pregled')).toBeInTheDocument();
  });

  it('uspješna prijava prikazuje zahvalu i čisti polje', async () => {
    wrap(<NewsletterWidget config={{}} />);
    const input = screen.getByPlaceholderText('t:common.email');
    await userEvent.type(input, 'navijac@example.com');
    await userEvent.click(screen.getByRole('button', { name: 't:actions.subscribe' }));
    expect(state.subscribe.mutateAsync).toHaveBeenCalledWith('navijac@example.com');
    expect(screen.getByText('Hvala na pretplati!')).toBeInTheDocument();
  });

  it('greška pretplate prikazuje poruku iz errora', async () => {
    state.subscribe = {
      mutateAsync: vi.fn().mockRejectedValue(new Error('Email je blokiran')),
      isPending: false,
      isError: true,
      error: new Error('Email je blokiran'),
    };
    wrap(<NewsletterWidget config={{}} />);
    expect(screen.getByText('Email je blokiran')).toBeInTheDocument();
  });

  it('bez poruke koristi rezervni tekst', async () => {
    state.subscribe = {
      mutateAsync: vi.fn().mockRejectedValue(new Error('')),
      isPending: false,
      isError: true,
      error: null,
    };
    wrap(<NewsletterWidget config={{}} />);
    expect(
      screen.getByText('Pretplata nije uspjela. Provjerite email i pokušajte ponovo.'),
    ).toBeInTheDocument();
  });

  it('dugme je onemogućeno dok slanje traje', () => {
    state.subscribe = {
      mutateAsync: vi.fn(),
      isPending: true,
      isError: false,
      error: null,
    };
    wrap(<NewsletterWidget config={{}} />);
    expect(screen.getByRole('button', { name: 't:actions.subscribe' })).toBeDisabled();
  });
});

describe('TicketsCtaWidget', () => {
  it('auto režim prosljeđuje naslov i tekst banneru', () => {
    wrap(<TicketsCtaWidget config={{ mode: 'auto', title: 'Karte', text: 'Derbi' }} />);
    expect(screen.getByTestId('auto-banner')).toHaveTextContent('Karte|Derbi');
  });

  it('auto režim bez teksta koristi prevedene fallbackove', () => {
    wrap(<TicketsCtaWidget config={{ mode: 'auto' }} />);
    expect(screen.getByTestId('auto-banner')).toHaveTextContent('t:home.tickets|bez teksta');
  });

  it('ručni režim je podrazumijevan i vodi na /ulaznice', () => {
    wrap(<TicketsCtaWidget config={{ mode: 'manual' }} />);
    expect(screen.getByRole('heading', { name: 't:home.tickets' })).toBeInTheDocument();
    expect(screen.getByText('t:home.ticketsDesc')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/ulaznice');
  });

  it('ručni režim poštuje config', () => {
    wrap(
      <TicketsCtaWidget
        config={{
          mode: 'manual',
          title: 'Karte za derbi',
          text: 'Kupi ranije',
          buttonLabel: 'Kupi',
          buttonUrl: '/karte',
        }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Karte za derbi' })).toBeInTheDocument();
    expect(screen.getByText('Kupi ranije')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kupi/ }).getAttribute('href')).toBe('/karte');
  });
});

describe('HeroNextMatchBanner', () => {
  it('bez utakmica ne renderira ništa', () => {
    const { container } = wrap(<HeroNextMatchBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('preskače završene i prošle utakmice', () => {
    state.matches = [
      { id: 'old', status: 'SCHEDULED', scheduledAt: '2020-01-01T10:00:00.000Z' },
      { id: 'done', status: 'FINISHED', scheduledAt: '2030-01-01T10:00:00.000Z' },
    ];
    const { container } = wrap(<HeroNextMatchBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje najbližu buduću utakmicu sa detaljima', () => {
    state.matches = [
      {
        id: 'far',
        status: 'SCHEDULED',
        scheduledAt: '2031-01-01T10:00:00.000Z',
        homeClub: { name: 'FK Gračanica' },
        awayClub: { name: 'FK Slavija' },
        venue: 'Gradski stadion',
      },
      {
        id: 'near',
        status: 'SCHEDULED',
        scheduledAt: '2030-01-01T10:00:00.000Z',
        homeClub: null,
        awayClub: null,
        venue: null,
      },
    ];
    wrap(<HeroNextMatchBanner />);
    expect(screen.getByText('Sljedeća utakmica')).toBeInTheDocument();
    expect(screen.getByText('Domaćin')).toBeInTheDocument();
    expect(screen.getByText('Gost')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/utakmice/near');
  });

  it('prikazuje imena klubova i stadion kad postoje', () => {
    state.matches = [
      {
        id: 'm1',
        status: 'SCHEDULED',
        scheduledAt: '2030-01-01T10:00:00.000Z',
        homeClub: { name: 'FK Gračanica' },
        awayClub: { name: 'FK Slavija' },
        venue: 'Gradski stadion',
      },
    ];
    wrap(<HeroNextMatchBanner />);
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('FK Slavija')).toBeInTheDocument();
    expect(screen.getByText('Gradski stadion')).toBeInTheDocument();
  });
});
