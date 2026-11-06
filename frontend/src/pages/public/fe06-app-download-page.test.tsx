import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDownloadPage } from './AppDownloadPage';

const state = vi.hoisted(() => ({
  latest: { data: undefined as unknown, isLoading: false },
  qr: vi.fn(),
  cards: [] as Record<string, unknown>[],
  guides: [] as Record<string, unknown>[],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}));
vi.mock('qrcode', () => ({
  default: { toDataURL: (...args: unknown[]) => state.qr(...(args as [])) },
}));
vi.mock('../../hooks/use-latest-android-release', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../hooks/use-latest-android-release')>();
  return { ...actual, useLatestAndroidRelease: () => state.latest };
});
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/public/app-download/InstallGuide', () => ({
  InstallGuide: (props: Record<string, unknown>) => {
    state.guides.push(props);
    return <div data-testid="install-guide" />;
  },
}));

const release = (over: Record<string, unknown> = {}) => ({
  version: '2.3.0',
  versionCode: 23,
  apkUrl: 'releases/app.apk',
  apkSizeBytes: 5 * 1024 * 1024,
  releaseNotes: 'Nove funkcije',
  publishedAt: null,
  ...over,
});

const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

describe('AppDownloadPage', () => {
  beforeEach(() => {
    state.latest = { data: undefined, isLoading: false };
    state.qr = vi.fn(async () => 'data:image/png;base64,AAA');
    state.cards = [];
    state.guides = [];
  });

  it('dok se izdanje učitava prikazuje skeleton', () => {
    state.latest = { data: undefined, isLoading: true };
    const { container } = render(<AppDownloadPage />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    expect(screen.queryByTestId('install-guide')).toBeNull();
  });

  it('bez izdanja prikazuje prazno stanje i ne pravi QR', () => {
    render(<AppDownloadPage />);
    expect(screen.getByText('appDownload.empty')).toBeTruthy();
    expect(state.qr).not.toHaveBeenCalled();
  });

  it('prikazuje verziju, veličinu i napomene izdanja', () => {
    state.latest = { data: release(), isLoading: false };
    render(<AppDownloadPage />);
    expect(screen.getByText('appDownload.version:{"version":"2.3.0"}')).toBeTruthy();
    expect(screen.getByText('appDownload.size:{"size":"5"}')).toBeTruthy();
    expect(screen.getByText('Nove funkcije')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'appDownload.download' }).getAttribute('href')).toContain(
      '/public/app-releases/android/latest/download',
    );
    expect(state.guides[0]).toEqual({ version: '2.3.0' });
  });

  it('veličina se zaokružuje na najmanje 1 MB', () => {
    state.latest = { data: release({ apkSizeBytes: 1024 }), isLoading: false };
    render(<AppDownloadPage />);
    expect(screen.getByText('appDownload.size:{"size":"1"}')).toBeTruthy();
  });

  it('bez napomena izdanja nema tog pasusa', () => {
    state.latest = { data: release({ releaseNotes: null }), isLoading: false };
    const { container } = render(<AppDownloadPage />);
    expect(container.textContent).not.toContain('Nove funkcije');
  });

  it('nakon generisanja prikazuje QR kod', async () => {
    state.latest = { data: release(), isLoading: false };
    const { container } = render(<AppDownloadPage />);
    await waitFor(() => expect(container.querySelector('img')).toBeTruthy());
    expect(state.qr).toHaveBeenCalledWith(expect.stringContaining('/download'), {
      width: 180,
      margin: 1,
    });
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('data:image/png;base64,AAA');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('greška pri generisanju QR-a ne ruši stranicu', async () => {
    state.qr = vi.fn(async () => {
      throw new Error('boom');
    });
    state.latest = { data: release(), isLoading: false };
    const { container } = render(<AppDownloadPage />);
    await waitFor(() => expect(state.qr).toHaveBeenCalled());
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByTestId('install-guide')).toBeTruthy();
  });
});
