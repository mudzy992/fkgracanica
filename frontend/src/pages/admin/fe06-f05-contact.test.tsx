import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactAdminPage } from './ContactAdminPage';

// jsdom nema nativni <dialog>.showModal — stub da mounted sheet ne baci TypeError i da sadržaj bude dostupan
beforeAll(() => {
  const show = function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
  const close = function (this: HTMLDialogElement) { this.removeAttribute('open'); };
  // prepiši bez obzira postoji li nativna implementacija (jsdom baca NotSupported)
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { value: show, configurable: true, writable: true });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { value: close, configurable: true, writable: true });
  try {
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get() { return this.hasAttribute('open'); },
      configurable: true,
    });
  } catch { /* već definisano */ }
});

const state = vi.hoisted(() => ({
  list: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0 as number | undefined,
    refetch: vi.fn(),
  } as Record<string, unknown>,
  markRead: { mutateAsync: vi.fn(async () => ({})), isPending: false } as Record<string, unknown>,
  markAll: { mutateAsync: vi.fn(async () => ({})), isPending: false } as Record<string, unknown>,
  remove: { mutateAsync: vi.fn(async () => ({})), isPending: false } as Record<string, unknown>,
  confirm: vi.fn(async () => true) as unknown as ReturnType<typeof vi.fn>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: unknown) => {
      if (typeof opts === 'string') return opts;
      const o = opts as Record<string, unknown> | undefined;
      if (o?.defaultValue) {
        let s = o.defaultValue as string;
        if (o.time) s = s.replace('{{time}}', o.time as string);
        if (o.name) s = s.replace('{{name}}', o.name as string);
        return s;
      }
      // fallback za ključeve koji u produkciji idu preko locale fajlova
      const map: Record<string, string> = {
        'admin.contactPage.title': 'Kontakt poruke',
        'admin.contact': 'Kontakt',
        'admin.contactPage.header.name': 'Ime',
        'admin.contactPage.header.email': 'Email',
        'admin.contactPage.header.subject': 'Naslov',
        'admin.contactPage.header.status': 'Status',
        'admin.contactPage.header.date': 'Datum',
        'admin.contactPage.empty': 'Nema poruka.',
        'admin.contactPage.markAllRead': 'Označi sve pročitanim',
        'admin.contactPage.unreadOnly': 'Samo nepročitane',
        'admin.contactPage.searchPlaceholder': 'Pretraži',
        'admin.contactPage.read': 'Pročitano',
        'admin.contactPage.new': 'Novo',
        'admin.contactPage.deleteTitle': 'Obrisati poruku?',
        'admin.contactPage.deleteDesc': 'Od: {{name}}',
        'admin.common.loading': 'Učitavanje…',
        'admin.home.refresh': 'Osvježi',
        'admin.home.lastUpdated': 'Ažurirano u {{time}}',
        'admin.contactMessage.from': 'Od',
        'admin.contactMessage.titleFallback': 'Kontakt poruka',
        'admin.contactMessage.markRead': 'Označi kao pročitano',
        'admin.contactMessage.date': 'Datum',
        'admin.contactMessage.message': 'Poruka',
        'common.loadError': 'Podatke nije moguće učitati.',
        'actions.retry': 'Pokušaj ponovo',
        'actions.delete': 'actions.delete',
        'admin.common.actions': 'Akcije',
        'actions.close': 'Zatvori',
      };
      if (map[k]) {
        let s = map[k];
        if (o?.name) s = s.replace('{{name}}', o.name as string);
        if (o?.time) s = s.replace('{{time}}', o.time as string);
        return s;
      }
      return k;
    },
  }),
}));

vi.mock('../../hooks/use-contact-admin', () => ({
  useContactMessages: () => state.list,
  useMarkContactRead: () => state.markRead,
  useMarkAllContactRead: () => state.markAll,
  useDeleteContact: () => state.remove,
}));

vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));

vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));

const msg = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  name: 'Ana Anić',
  email: 'ana@fk.ba',
  subject: 'Pitanje o ulaznici',
  message: 'Pozdrav, kada...',
  isRead: false,
  createdAt: '2026-05-10T10:00:00.000Z',
  ...over,
});

beforeEach(() => {
  state.list = {
    data: { data: [], meta: undefined },
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as typeof state.list;
  (state.markRead as { isPending: boolean }).isPending = false;
  (state.markAll as { isPending: boolean }).isPending = false;
  (state.remove as { isPending: boolean }).isPending = false;
  state.confirm = vi.fn(async () => true) as unknown as typeof state.confirm;
});

describe('F-05 ContactAdminPage — standalone', () => {
  it('P2-1 isLoading → aria-busy Skeleton, sačuvan h1', () => {
    state.list = { ...state.list, isLoading: true } as unknown as typeof state.list;
    render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Kontakt poruke')).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('P2-1 isError → role=alert + retry disabled isFetching', () => {
    const refetch = vi.fn();
    state.list = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch,
    } as unknown as typeof state.list;
    const { rerender } = render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const retry = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(retry).not.toBeDisabled();

    state.list = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch,
    } as unknown as typeof state.list;
    rerender(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(within(screen.getByRole('alert')).getByRole('button')).toBeDisabled();
  });

  it('P2-1 success → lastUpdated/Osvježi i isFetching disabled + Učitavanje…', () => {
    const ts = Date.now();
    state.list = {
      ...state.list,
      data: { data: [msg()], meta: { page: 1, totalPages: 1 } },
      dataUpdatedAt: ts,
      isFetching: false,
    } as unknown as typeof state.list;
    const { rerender } = render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Ažurirano u/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();

    state.list = {
      ...state.list,
      data: { data: [msg()], meta: { page: 1, totalPages: 1 } },
      dataUpdatedAt: ts,
      isFetching: true,
    } as unknown as typeof state.list;
    rerender(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    const loadingBtn = screen.getByRole('button', { name: 'Učitavanje…' });
    expect(loadingBtn).toBeDisabled();
  });

  it('P2-3/P2-5 empty → status role + t(defaultValue)', () => {
    state.list = { ...state.list, data: { data: [], meta: undefined } } as unknown as typeof state.list;
    render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Nema poruka.');
  });

  it('P2-3 headeri i badge preko t(defaultValue) + subject fallback', () => {
    state.list = {
      ...state.list,
      data: { data: [msg({ subject: null, isRead: true }), msg({ id: 'm2', isRead: false })], meta: undefined },
    } as unknown as typeof state.list;
    render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Ime')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Naslov')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Datum')).toBeInTheDocument();
    expect(screen.getByText('Pročitano')).toBeInTheDocument();
    expect(screen.getByText('Novo')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('P2-6 paginacija disabled isFetching + aria-live', () => {
    state.list = {
      ...state.list,
      data: { data: [msg()], meta: { page: 1, totalPages: 3, total: 30, limit: 10 } },
      isFetching: true,
    } as unknown as typeof state.list;
    render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText('1 / 3').getAttribute('aria-live')).toBe('polite');
    expect(screen.getByRole('button', { name: 'Prethodna' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sljedeća' })).toBeDisabled();
  });

  it('P2-4 Input placeholder preko t(defaultValue) Pretraži i unreadOnly t', () => {
    state.list = { ...state.list, data: { data: [], meta: undefined } } as unknown as typeof state.list;
    render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText('Pretraži')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Samo nepročitane' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Označi sve pročitanim' })).toBeInTheDocument();
  });

  it('P2-7 markAll disabled isPending||isFetching i delete disabled', () => {
    (state.markAll as { isPending: boolean }).isPending = true;
    state.list = { ...state.list, data: { data: [msg()], meta: undefined }, isFetching: false } as unknown as typeof state.list;
    const { rerender } = render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Označi sve pročitanim' })).toBeDisabled();

    (state.markAll as { isPending: boolean }).isPending = false;
    (state.remove as { isPending: boolean }).isPending = true;
    rerender(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('actions.delete')).toBeDisabled();
  });

  it('P2-7 delete disabled i kad je isFetching', () => {
    state.list = { ...state.list, data: { data: [msg()], meta: undefined }, isFetching: true } as unknown as typeof state.list;
    render(
      <MemoryRouter>
        <ContactAdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('actions.delete')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Označi sve pročitanim' })).toBeDisabled();
  });
});

describe('F-05 ContactAdminPage — embedded', () => {
  it('P2-2 embedded isLoading → aria-busy, isError → role=alert', () => {
    state.list = { ...state.list, isLoading: true } as unknown as typeof state.list;
    const { rerender } = render(
      <MemoryRouter>
        <ContactAdminPage embedded />
      </MemoryRouter>,
    );
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByText('Kontakt poruke')).not.toBeInTheDocument();

    state.list = { ...state.list, isLoading: false, isError: true } as unknown as typeof state.list;
    rerender(
      <MemoryRouter>
        <ContactAdminPage embedded />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Greška pri učitavanju.')).toBeInTheDocument();
  });

  it('P2-2 embedded success → lastUpdated/Osvježi', () => {
    const ts = Date.now();
    state.list = {
      ...state.list,
      data: { data: [msg()], meta: undefined },
      dataUpdatedAt: ts,
      isFetching: false,
    } as unknown as typeof state.list;
    render(
      <MemoryRouter>
        <ContactAdminPage embedded />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Ažurirano u/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Osvježi' })).not.toBeDisabled();
  });

  it('P2-2 embedded error retry disabled isFetching + Učitavanje…', () => {
    // embedded path ima custom alert sa switchom Učitavanje…
    state.list = { ...state.list, isError: true, isFetching: true } as unknown as typeof state.list;
    render(
      <MemoryRouter>
        <ContactAdminPage embedded />
      </MemoryRouter>,
    );
    const alert = screen.getByRole('alert');
    expect(within(alert).getByRole('button', { name: 'Učitavanje…' })).toBeDisabled();
  });
});

describe('F-05 ContactMessageSheet', () => {
  it('P2-8 sheet title/from/markRead preko t(defaultValue)', async () => {
    const { ContactMessageSheet } = await import('./ContactMessageSheet');
    const { rerender } = render(
      <MemoryRouter>
        <ContactMessageSheet message={msg({ subject: null }) as unknown as never} open onOpenChange={() => {}} onMarkRead={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Kontakt poruka')).toBeInTheDocument();
    expect(screen.getByText('Od')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Označi kao pročitano' })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ContactMessageSheet message={msg({ subject: 'Hej' }) as unknown as never} open onOpenChange={() => {}} onMarkRead={() => {}} />
      </MemoryRouter>,
    );
    // fallback subjekt Hej u titleu dialoga
    expect(screen.getByText('Hej')).toBeInTheDocument();
  });

  it('P2-8 sheet isMarking disabled', async () => {
    const { ContactMessageSheet } = await import('./ContactMessageSheet');
    render(
      <MemoryRouter>
        <ContactMessageSheet message={msg() as unknown as never} open onOpenChange={() => {}} onMarkRead={() => {}} isMarking />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Označi kao pročitano' })).toBeDisabled();
  });
});
