import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsletterAdminPage } from './NewsletterAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  data: undefined as unknown,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  params: [] as Array<Record<string, unknown>>,
  confirm: vi.fn(),
  unsubscribe: vi.fn(),
  unsubPending: false,
  apiGet: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-newsletter-admin', () => ({
  useNewsletterSubscribers: (params: Record<string, unknown>) => {
    state.params.push(params);
    return {
      data: state.data,
      isLoading: state.isLoading,
      isError: state.isError,
      refetch: state.refetch,
    };
  },
  useUnsubscribeNewsletter: () => ({ mutateAsync: state.unsubscribe, isPending: state.unsubPending }),
}));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../lib/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/utils')>()),
  formatDateTime: (v: string) => `dt:${v}`,
}));
vi.mock('../../lib/api', () => ({ api: { get: state.apiGet } }));
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/newsletter/NewsletterCampaignPanel', () => ({
  NewsletterCampaignPanel: () => <div>panel-kampanja</div>,
}));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../test/doubles/admin-shell-doubles');
  return {
    AdminPageShell: doubles.AdminPageShellDouble,
    AdminDataTable: doubles.AdminDataTableDouble,
  };
});
vi.mock('../../components/admin/AdminPagination', async () => ({
  AdminPagination: (await import('../../test/doubles/admin-shell-doubles')).AdminPaginationDouble,
}));

const subscriber = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  email: 'a@mail.ba',
  isActive: true,
  createdAt: '2026-01-02T10:00:00.000Z',
  ...over,
});

beforeEach(() => {
  state.data = { data: [subscriber(), subscriber({ id: 's2', email: 'b@mail.ba', isActive: false })], meta: null };
  state.isLoading = false;
  state.isError = false;
  state.refetch.mockReset();
  state.params = [];
  state.confirm.mockReset();
  state.confirm.mockResolvedValue(true);
  state.unsubscribe.mockReset();
  state.unsubscribe.mockResolvedValue({});
  state.unsubPending = false;
  state.apiGet.mockReset();
  state.apiGet.mockResolvedValue({ data: new Blob(['a@mail.ba']) });
  adminShellState.retried = 0;
});

describe('NewsletterAdminPage — ljuska i tabela', () => {
  it('ugrađeni prikaz nema naslov ljuske ni SEO', () => {
    render(<NewsletterAdminPage embedded />);
    expect(screen.queryByText('seo:Newsletter')).toBeNull();
    expect(adminShellState.title).toBe('');
    expect(screen.getByText('a@mail.ba')).toBeInTheDocument();
  });

  it('samostalna stranica ima naslov i SEO', () => {
    render(<NewsletterAdminPage />);
    expect(screen.getByText('seo:Newsletter')).toBeInTheDocument();
    expect(screen.getByText('admin.newsletterPage.subscribersTitle')).toBeInTheDocument();
  });

  it('prikazuje status pretplatnika i datum prijave', () => {
    render(<NewsletterAdminPage embedded />);
    expect(within(screen.getByTestId('row-s1')).getByText('Aktivan')).toBeInTheDocument();
    expect(within(screen.getByTestId('row-s2')).getByText('Neaktivan')).toBeInTheDocument();
    expect(screen.getAllByText('dt:2026-01-02T10:00:00.000Z')).toHaveLength(2);
  });

  it('prazna lista daje poruku bez pretplatnika', () => {
    state.data = undefined;
    render(<NewsletterAdminPage embedded />);
    expect(screen.getByText('Nema pretplatnika.')).toBeInTheDocument();
  });
});

describe('NewsletterAdminPage — pretraga, tabovi, izvoz', () => {
  it('unos u pretragu šalje parametar i vraća na prvu stranicu', async () => {
    const user = userEvent.setup();
    render(<NewsletterAdminPage embedded />);
    expect(state.params.at(-1)).toEqual({ page: 1, search: undefined });
    const input = screen.getByPlaceholderText('admin.newsletterPage.searchPlaceholder');
    await user.type(input, 'ana');
    expect(state.params.at(-1)).toEqual({ page: 1, search: 'ana' });
  });

  it('tab Kampanje zamjenjuje tabelu panelom', async () => {
    const user = userEvent.setup();
    render(<NewsletterAdminPage embedded />);
    expect(screen.queryByText('panel-kampanja')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Kampanje' }));
    expect(screen.getByText('panel-kampanja')).toBeInTheDocument();
    expect(screen.queryByText('a@mail.ba')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Pretplatnici' }));
    expect(screen.queryByText('panel-kampanja')).toBeNull();
    expect(screen.getByText('a@mail.ba')).toBeInTheDocument();
  });

  it('izvoz CSV dohvata blob i pokreće preuzimanje', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:newsletter');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<NewsletterAdminPage embedded />);
    await user.click(screen.getByRole('button', { name: 'Export CSV' }));
    await waitFor(() =>
      expect(state.apiGet).toHaveBeenCalledWith('/newsletter/export/csv', { responseType: 'blob' }),
    );
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:newsletter');
    click.mockRestore();
    vi.unstubAllGlobals();
  });
});

describe('NewsletterAdminPage — odjava i paginacija', () => {
  it('odjava traži potvrdu pa poziva mutaciju sa emailom', async () => {
    const user = userEvent.setup();
    render(<NewsletterAdminPage embedded />);
    const row = screen.getByTestId('row-s1');
    await user.click(within(row).getByRole('button', { name: 'Odjavi' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Odjaviti pretplatnika?',
        description: 'a@mail.ba',
        confirmLabel: 'Odjavi',
        variant: 'danger',
      }),
    );
    await waitFor(() => expect(state.unsubscribe).toHaveBeenCalledWith('a@mail.ba'));
  });

  it('neaktivan nema odjavu, a otkazana potvrda ne šalje zahtjev', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    render(<NewsletterAdminPage embedded />);
    expect(within(screen.getByTestId('row-s2')).queryByRole('button', { name: 'Odjavi' })).toBeNull();
    await user.click(within(screen.getByTestId('row-s1')).getByRole('button', { name: 'Odjavi' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.unsubscribe).not.toHaveBeenCalled();
  });

  it('mutacija u toku onemogućava dugme odjave', () => {
    state.unsubPending = true;
    render(<NewsletterAdminPage embedded />);
    expect(within(screen.getByTestId('row-s1')).getByRole('button', { name: 'Odjavi' })).toBeDisabled();
  });

  it('paginacija se prikazuje uz meta i mijenja stranicu', async () => {
    const user = userEvent.setup();
    state.data = { data: [subscriber()], meta: { totalPages: 3 } };
    render(<NewsletterAdminPage embedded />);
    expect(screen.getByText('stranica:1/3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sljedeća' }));
    expect(state.params.at(-1)).toEqual({ page: 2, search: undefined });
  });

  it('greška učitavanja nudi ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.isError = true;
    render(<NewsletterAdminPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(adminShellState.retried).toBe(1);
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });
});
