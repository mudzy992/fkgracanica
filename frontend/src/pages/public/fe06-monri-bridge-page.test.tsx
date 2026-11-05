import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MonriBridgePage } from './MonriBridgePage';

const state = vi.hoisted(() => ({
  isAuthenticated: true,
  isLoading: false,
  get: vi.fn(),
  seo: {} as Record<string, unknown>,
  submitted: 0,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ isAuthenticated: state.isAuthenticated, isLoading: state.isLoading }),
}));
vi.mock('../../lib/api', () => ({
  api: { get: (url: string, config: unknown) => state.get(url, config) },
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo = props;
    return <div>seo:{String(props.noindex)}</div>;
  },
}));
vi.mock('../../components/ui/skeleton', () => ({ Skeleton: () => <div>skeleton</div> }));

const renderPage = (path = '/plati?sid=s1') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <MonriBridgePage />
    </MemoryRouter>,
  );

const bodyForms = () =>
  Array.from(document.body.children).filter((el) => el.tagName === 'FORM') as HTMLFormElement[];

beforeEach(() => {
  state.isAuthenticated = true;
  state.isLoading = false;
  state.get.mockReset();
  state.get.mockResolvedValue({
    data: { action: 'https://monri.example/pay', fields: { token: 't1', amount: '40' } },
  });
  state.seo = {};
  vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {
    state.submitted += 1;
  });
  state.submitted = 0;
});

afterEach(() => {
  bodyForms().forEach((form) => form.remove());
  vi.restoreAllMocks();
});

describe('MonriBridgePage — stanja prije slanja', () => {
  it('dok traje provjera sesije prikazuje skeleton bez zahtjeva', () => {
    state.isLoading = true;
    renderPage();
    expect(screen.getAllByText('skeleton').length).toBeGreaterThan(0);
    expect(state.get).not.toHaveBeenCalled();
  });

  it('neprijavljen korisnik dobija poruku i povratak na ulaznice', () => {
    state.isAuthenticated = false;
    renderPage();
    expect(screen.getByText('pages.monri.needLogin')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'pages.monri.back' })).toHaveAttribute(
      'href',
      '/ulaznice',
    );
    expect(state.get).not.toHaveBeenCalled();
  });

  it('članska sesija vraća na članstvo', () => {
    state.isAuthenticated = false;
    renderPage('/plati?sid=m-42');
    expect(screen.getByRole('link', { name: 'pages.monri.back' })).toHaveAttribute(
      'href',
      '/clanstvo',
    );
  });

  it('nedostajući sid prikazuje poruku bez zahtjeva', () => {
    renderPage('/plati');
    expect(screen.getByText('pages.monri.missingSession')).toBeInTheDocument();
    expect(state.get).not.toHaveBeenCalled();
  });

  it('SEO je noindex u svim stanjima', () => {
    state.isAuthenticated = false;
    renderPage();
    expect(screen.getByText('seo:true')).toBeInTheDocument();
    expect(state.seo).toMatchObject({ noindex: true, title: 'pages.monri.seoTitle' });
  });
});

describe('MonriBridgePage — slanje forme', () => {
  it('traži formu sa sesijom i originom pa je predaje banci', async () => {
    renderPage();
    await waitFor(() => expect(state.submitted).toBe(1));
    expect(state.get).toHaveBeenCalledWith('/payments/monri/form', {
      params: { sessionId: 's1', origin: window.location.origin },
    });
    const form = bodyForms()[0];
    expect(form.method).toBe('post');
    expect(form.getAttribute('action')).toBe('https://monri.example/pay');
    const inputs = Array.from(form.querySelectorAll('input'));
    expect(inputs.map((i) => [i.name, i.value, i.type])).toEqual([
      ['token', 't1', 'hidden'],
      ['amount', '40', 'hidden'],
    ]);
  });

  it('greška API-ja prikazuje poruku umjesto slanja', async () => {
    state.get.mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('pages.monri.formNotReady')).toBeInTheDocument(),
    );
    expect(bodyForms()).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'pages.monri.back' })).toBeInTheDocument();
  });

  it('ne šalje drugi zahtjev ni drugu formu pri ponovnom renderu', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/plati?sid=s1']}>
        <MonriBridgePage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(state.submitted).toBe(1));
    rerender(
      <MemoryRouter initialEntries={['/plati?sid=s1']}>
        <MonriBridgePage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(state.get).toHaveBeenCalledTimes(1));
    expect(bodyForms()).toHaveLength(1);
  });
});
