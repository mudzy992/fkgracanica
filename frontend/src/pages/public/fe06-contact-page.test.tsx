import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactPage } from './ContactPage';

const state = vi.hoisted(() => ({
  settings: { data: undefined as unknown },
  auth: { user: undefined as unknown, isAuthenticated: false },
  submit: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  seo: [] as Record<string, unknown>[],
  heroes: [] as Record<string, unknown>[],
  asides: [] as Record<string, unknown>[],
  panels: [] as Record<string, unknown>[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => state.settings,
  useContactSubmit: () => state.submit,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));
vi.mock('../../components/public/contact/ContactCinematicHero', () => ({
  ContactCinematicHero: (props: Record<string, unknown>) => {
    state.heroes.push(props);
    return <div data-testid="contact-hero" />;
  },
}));
vi.mock('../../components/public/contact/ContactInfoAside', () => ({
  ContactInfoAside: (props: Record<string, unknown>) => {
    state.asides.push(props);
    return <div data-testid="contact-aside" />;
  },
}));
vi.mock('../../components/public/contact/ContactFormPanel', () => ({
  ContactFormPanel: (props: Record<string, unknown>) => {
    state.panels.push(props);
    return (
      <div data-testid="contact-form">
        <button onClick={() => void (props.onSubmit as (d: unknown) => Promise<void>)({ name: 'A', email: 'a@b.c', message: 'M' })}>
          pošalji
        </button>
      </div>
    );
  },
}));

describe('ContactPage', () => {
  beforeEach(() => {
    state.settings = { data: undefined };
    state.auth = { user: undefined, isAuthenticated: false };
    state.submit = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.seo = [];
    state.heroes = [];
    state.asides = [];
    state.panels = [];
  });

  it('postavlja SEO i prosleđuje kontakt podatke', () => {
    state.settings = {
      data: { 'contact.email': 'info@fk.ba', 'contact.phone': '+387 61', 'contact.address': 'Gračanica' },
    };
    render(<ContactPage />);
    expect(state.seo[0]).toEqual({ title: 'contactPage.seoTitle', description: 'contactPage.seoDesc' });
    expect(state.heroes[0]).toEqual({ hasEmail: true, hasPhone: true, hasAddress: true });
    expect(state.asides[0]).toEqual({
      email: 'info@fk.ba',
      phone: '+387 61',
      address: 'Gračanica',
    });
  });

  it('bez postavki hero dobija false vrijednosti', () => {
    render(<ContactPage />);
    expect(state.heroes[0]).toEqual({ hasEmail: false, hasPhone: false, hasAddress: false });
  });

  it('neprijavljeni korisnik nema početne vrijednosti forme', () => {
    render(<ContactPage />);
    expect((state.panels[0].defaultValues as Record<string, string>)).toEqual({});
    expect(state.panels[0].sent).toBe(false);
  });

  it('prijavljeni korisnik dobija ime i email kao početne vrijednosti', () => {
    state.auth = {
      isAuthenticated: true,
      user: { firstName: 'Amar', lastName: 'Hodžić', email: 'amar@example.com' },
    };
    render(<ContactPage />);
    expect(state.panels.at(-1)?.defaultValues).toEqual({
      email: 'amar@example.com',
      name: 'Amar Hodžić',
    });
  });

  it('prijavljeni korisnik bez imena dobija samo email', () => {
    state.auth = { isAuthenticated: true, user: { email: 'x@y.z' } };
    render(<ContactPage />);
    expect(state.panels.at(-1)?.defaultValues).toEqual({ email: 'x@y.z' });
  });

  it('prijavljeni korisnik bez emaila dobija samo ime', () => {
    state.auth = { isAuthenticated: true, user: { firstName: 'Amar', lastName: 'Hodžić' } };
    render(<ContactPage />);
    expect(state.panels.at(-1)?.defaultValues).toEqual({ name: 'Amar Hodžić' });
  });

  it('isAuthenticated bez korisnika ne mijenja formu', () => {
    state.auth = { isAuthenticated: true, user: undefined };
    render(<ContactPage />);
    expect((state.panels[0].defaultValues as Record<string, string>)).toEqual({});
  });

  it('slanje poruke poziva hook i označava poslano', async () => {
    render(<ContactPage />);
    await userEvent.click(screen.getByRole('button', { name: 'pošalji' }));
    expect(state.submit.mutateAsync).toHaveBeenCalledWith({ name: 'A', email: 'a@b.c', message: 'M' });
    expect(state.panels.at(-1)?.sent).toBe(true);
  });

  it('pending stanje se prosljeđuje formi', () => {
    state.submit = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<ContactPage />);
    expect(state.panels[0].pending).toBe(true);
  });
});
