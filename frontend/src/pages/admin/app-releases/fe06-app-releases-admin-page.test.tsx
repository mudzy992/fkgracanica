import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppReleasesAdminPage } from './AppReleasesAdminPage';

const state = vi.hoisted(() => ({
  list: { data: undefined as unknown, isLoading: false },
  pending: false,
  calls: [] as Array<{ method: string; url: string; body?: unknown; headers?: unknown }>,
  invalidate: vi.fn(),
  form: {} as Record<string, unknown>,
  queryOptions: undefined as undefined | { queryFn?: () => Promise<unknown> },
  uploadGate: Promise.resolve({ apkPath: 'apps/app-1.2.3.apk', apkSha256: 'abc', apkSizeBytes: 1024 }),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: state.invalidate }),
  useQuery: (options: { queryFn?: () => Promise<unknown> }) => {
    state.queryOptions = options;
    return state.list;
  },
  useMutation: (options: { mutationFn?: (arg: unknown) => unknown; onSuccess?: () => void }) => ({
    isPending: state.pending,
    mutateAsync: async (arg: unknown) => {
      const result = await options.mutationFn?.(arg); options.onSuccess?.(); return result;
    },
  }),
}));
vi.mock('../../../lib/api', () => ({
  api: {
    get: async (url: string) => {
      state.calls.push({ method: 'get', url });
      return { data: state.list.data ?? [] };
    },
    post: async (url: string, body?: unknown, config?: { headers?: unknown }) => {
      if (url.endsWith('/upload')) {
        state.calls.push({ method: 'post', url, body, headers: config?.headers });
        return { data: await state.uploadGate };
      }
      state.calls.push({ method: 'post', url, body });
      return { data: { id: 'new' } };
    },
    patch: async (url: string, body?: unknown) => {
      state.calls.push({ method: 'patch', url, body });
      return { data: { ok: true } };
    },
  },
}));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../../test/doubles/admin-shell-doubles');
  return {
    AdminPageShell: doubles.AdminPageShellDouble,
    AdminDataTable: doubles.AdminDataTableDouble,
  };
});
vi.mock('./AppReleaseCreateForm', () => ({
  AppReleaseCreateForm: (props: Record<string, unknown>) => {
    state.form = props;
    return (
      <div>
        forma:uploading={String(props.uploading)}:creating={String(props.creating)}
        <button onClick={() => void (props.onUpload as (f: File) => Promise<unknown>)(new File(['x'], 'app.apk'))}>
          posalji-fajl
        </button>
        <button onClick={() => void (props.onCreate as (b: unknown) => Promise<void>)({ version: '1.2.3' })}>
          kreiraj-verziju
        </button>
      </div>
    );
  },
}));

const release = (over: Record<string, unknown> = {}) => ({
  id: 'a1',
  version: '1.2.3',
  versionCode: 12,
  forceUpdate: false,
  status: 'DRAFT',
  publishedAt: null,
  ...over,
});

beforeEach(() => {
  state.list = { data: [release()], isLoading: false };
  state.pending = false;
  state.calls = [];
  state.invalidate.mockReset();
  state.form = {};
  state.uploadGate = Promise.resolve({ apkPath: 'apps/app-1.2.3.apk', apkSha256: 'abc', apkSizeBytes: 1024 });
});

describe('AppReleasesAdminPage — tabela', () => {
  it('prikazuje naslov, SEO i verzije', () => {
    render(<AppReleasesAdminPage />);
    expect(screen.getByText('seo:admin.releases.metaTitle')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.releases.title' })).toBeInTheDocument();
    expect(screen.getByText('1.2.3')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.queryByText('admin.releases.required')).toBeNull();
  });

  it('objavljena verzija nema dugme Objavi', () => {
    state.list = { data: [release({ status: 'PUBLISHED', publishedAt: '2026-01-01' })], isLoading: false };
    render(<AppReleasesAdminPage />);
    expect(screen.queryByRole('button', { name: 'Objavi' })).toBeNull();
  });

  it('verzija sa obaveznim ažuriranjem dobija oznaku', () => {
    state.list = { data: [release({ forceUpdate: true })], isLoading: false };
    render(<AppReleasesAdminPage />);
    expect(screen.getByText('admin.releases.required')).toBeInTheDocument();
  });

  it('dok se lista učitava prikazuje stanje učitavanja', () => {
    state.list = { data: undefined, isLoading: true };
    render(<AppReleasesAdminPage />);
    expect(screen.getByText('učitavanje')).toBeInTheDocument();
  });

  it('bez verzija tabela je prazna', () => {
    state.list = { data: [], isLoading: false };
    render(<AppReleasesAdminPage />);
    expect(screen.queryByText('1.2.3')).toBeNull();
  });
});

describe('AppReleasesAdminPage — akcije', () => {
  it('objavljivanje mijenja status i osvježava listu', async () => {
    const user = userEvent.setup();
    render(<AppReleasesAdminPage />);
    await user.click(screen.getByRole('button', { name: 'Objavi' }));
    await waitFor(() => expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['app-releases'] }));
    expect(state.calls).toContainEqual({
      method: 'patch',
      url: '/app-releases/a1',
      body: { status: 'PUBLISHED' },
    });
  });

  it('dok je objavljivanje u toku dugme je onemogućeno', () => {
    state.pending = true;
    render(<AppReleasesAdminPage />);
    expect(screen.getByRole('button', { name: 'Objavi' })).toBeDisabled();
  });

  it('kreiranje verzije šalje tijelo i osvježava listu', async () => {
    const user = userEvent.setup();
    render(<AppReleasesAdminPage />);
    await user.click(screen.getByRole('button', { name: 'kreiraj-verziju' }));
    await waitFor(() => expect(state.invalidate).toHaveBeenCalled());
    expect(state.calls).toContainEqual({
      method: 'post',
      url: '/app-releases',
      body: { version: '1.2.3' },
    });
  });

  it('upload šalje FormData kao multipart i vraća metapodatke', async () => {
    let releaseUpload: (value: unknown) => void = () => undefined;
    type UploadResult = { apkPath: string; apkSha256: string; apkSizeBytes: number };
    state.uploadGate = new Promise<UploadResult>((resolve) => {
      releaseUpload = (value) => resolve(value as UploadResult);
    });
    const user = userEvent.setup();
    render(<AppReleasesAdminPage />);
    expect(state.form.uploading).toBe(false);
    await user.click(screen.getByRole('button', { name: 'posalji-fajl' }));
    await waitFor(() => expect(state.form.uploading).toBe(true));
    const call = state.calls.find((c) => c.url.endsWith('/upload'));
    expect(call?.method).toBe('post');
    expect(call?.body).toBeInstanceOf(FormData);
    expect((call?.body as FormData).get('file')).toBeInstanceOf(File);
    expect(call?.headers).toEqual({ 'Content-Type': undefined });
    releaseUpload({ apkPath: 'apps/app-1.2.3.apk', apkSha256: 'abc', apkSizeBytes: 1024 });
    await waitFor(() => expect(state.form.uploading).toBe(false));
  });

  it('stanje kreiranja se prosljeđuje formi', () => {
    state.pending = true;
    render(<AppReleasesAdminPage />);
    expect(state.form.creating).toBe(true);
    expect(screen.getByText('forma:uploading=false:creating=true')).toBeInTheDocument();
  });
});

describe('AppReleasesAdminPage — upit', () => {
  it('queryFn dohvaća listu izdanja', async () => {
    render(<AppReleasesAdminPage />);
    const options = state.queryOptions as { queryFn: () => Promise<unknown> };
    state.calls.length = 0;
    expect(Array.isArray(await options.queryFn())).toBe(true);
    expect(state.calls).toContainEqual({ method: 'get', url: '/app-releases' });
  });
});
