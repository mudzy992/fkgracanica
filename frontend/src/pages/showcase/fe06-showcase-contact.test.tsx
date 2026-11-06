import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CtaSection } from './sections/CtaSection';
import { ShowcaseContactForm } from './ShowcaseContactForm';
import type { ShowcaseClub } from './types';

const state = vi.hoisted(() => ({
  contact: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  newsletter: {
    mutateAsync: vi.fn(async () => ({})),
    isPending: false,
    isError: false,
    error: null as unknown,
  },
}));

vi.mock('../../hooks', () => ({
  useContactSubmit: () => state.contact,
  useSubscribeNewsletter: () => state.newsletter,
}));

const club = (over: Partial<ShowcaseClub> = {}): ShowcaseClub => ({
  name: 'FK Gračanica',
  tagline: 'Ponos',
  crestUrl: 'originals/crest.png',
  email: 'info@fk.ba',
  phone: '+387 61 000',
  address: 'Gračanica',
  launchNote: 'Uskoro',
  ...over,
});

const contactForm = (over: Record<string, unknown> = {}) => ({
  sent: false,
  pending: false,
  onSubmit: vi.fn(async () => {}),
  ...over,
});

describe('CtaSection', () => {
  beforeEach(() => {
    state.contact = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.newsletter = {
      mutateAsync: vi.fn(async () => ({})),
      isPending: false,
      isError: false,
      error: null,
    };
  });

  it('prikazuje kontakt podatke kada postoje', () => {
    render(<CtaSection club={club()} index={1} />);
    expect(screen.getByText('info@fk.ba')).toBeTruthy();
    expect(screen.getByText('+387 61 000')).toBeTruthy();
    expect(screen.getByText('Gračanica')).toBeTruthy();
  });

  it('prazni kontakt podaci se ne prikazuju', () => {
    render(<CtaSection club={club({ email: '', phone: '', address: '' })} index={1} />);
    expect(screen.queryByText('Telefon')).toBeNull();
    expect(screen.queryByText('Adresa')).toBeNull();
    expect(screen.getAllByText('Email')).toHaveLength(1);
  });

  it('uspješna prijava na newsletter prikazuje potvrdu i čisti polje', async () => {
    render(<CtaSection club={club()} index={1} />);
    await userEvent.type(screen.getAllByPlaceholderText('vas@email.com')[0], 'navijac@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Pretplati se' }));
    await waitFor(() => expect(screen.getByText('Hvala na pretplati.')).toBeTruthy());
    expect(state.newsletter.mutateAsync).toHaveBeenCalledWith('navijac@example.com');
  });

  it('greška pretplate prikazuje poruku', async () => {
    state.newsletter = {
      mutateAsync: vi.fn(async () => {
        throw new Error('boom');
      }),
      isPending: false,
      isError: true,
      error: { isAxiosError: true, response: { data: { message: 'Prijava nije moguća.' } } },
    };
    render(<CtaSection club={club()} index={1} />);
    await userEvent.type(screen.getAllByPlaceholderText('vas@email.com')[0], 'a@b.c');
    await userEvent.click(screen.getByRole('button', { name: 'Pretplati se' }));
    await waitFor(() =>
      expect(screen.getByText(/Prijava nije moguća\.|Pretplata nije uspjela\./)).toBeTruthy(),
    );
    expect(screen.queryByText('Hvala na pretplati.')).toBeNull();
  });

  it('tokom pretplate dugme je onemogućeno', () => {
    state.newsletter = {
      mutateAsync: vi.fn(async () => ({})),
      isPending: true,
      isError: false,
      error: null,
    };
    render(<CtaSection club={club()} index={1} />);
    expect((screen.getByRole('button', { name: 'Pretplati se' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('uspješno slanje kontakt forme zamjenjuje formu potvrdom', async () => {
    render(<CtaSection club={club()} index={1} />);
    await userEvent.type(screen.getByPlaceholderText('Vaše ime'), 'Amar');
    await userEvent.type(screen.getAllByPlaceholderText('vas@email.com')[1], 'amar@example.com');
    await userEvent.type(screen.getByPlaceholderText('Kako možemo pomoći?'), 'Duga poruka za klub');
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji poruku' }));
    await waitFor(() => expect(screen.getByText('Poruka je poslana')).toBeTruthy());
    expect(state.contact.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Amar', email: 'amar@example.com' }),
    );
  });
});

describe('ShowcaseContactForm', () => {
  it('validira ime, email i poruku', async () => {
    const onSubmit = vi.fn(async () => {});
    render(<ShowcaseContactForm {...contactForm({ onSubmit })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji poruku' }));
    await waitFor(() =>
      expect(screen.getByText('Unesite ime (min. 2 znaka)')).toBeTruthy(),
    );
    expect(screen.getByText('Unesite ispravan email')).toBeTruthy();
    expect(screen.getByText('Poruka mora imati najmanje 10 znakova')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('ispravni podaci zovu onSubmit', async () => {
    const onSubmit = vi.fn(async () => {});
    render(<ShowcaseContactForm {...contactForm({ onSubmit })} />);
    await userEvent.type(screen.getByPlaceholderText('Vaše ime'), 'Amar');
    await userEvent.type(screen.getByPlaceholderText('vas@email.com'), 'amar@example.com');
    await userEvent.type(screen.getByPlaceholderText('Naslov poruke'), 'Upit');
    await userEvent.type(screen.getByPlaceholderText('Kako možemo pomoći?'), 'Zanima me članstvo.');
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji poruku' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const args = onSubmit.mock.calls as unknown as [Record<string, unknown>][];
    expect(args[0][0]).toMatchObject({
      name: 'Amar',
      email: 'amar@example.com',
      subject: 'Upit',
    });
  });

  it('pending mijenja tekst i onemogućava dugme', () => {
    render(<ShowcaseContactForm {...contactForm({ pending: true })} />);
    const btn = screen.getByRole('button', { name: 'Šaljem…' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('poslana poruka prikazuje potvrdu bez forme', () => {
    render(<ShowcaseContactForm {...contactForm({ sent: true })} />);
    expect(screen.getByText('Poruka je poslana')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Pošalji poruku' })).toBeNull();
    expect(screen.queryByPlaceholderText('Vaše ime')).toBeNull();
  });
});
