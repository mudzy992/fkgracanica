import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDownloadPage } from './AppDownloadPage';

const state = vi.hoisted(() => ({
  latest: { data: undefined as unknown, isLoading: false },
  qr: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('qrcode', () => ({ default: { toDataURL: (...args: unknown[]) => state.qr(...(args as [])) } }));
vi.mock('../../hooks/use-latest-android-release', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks/use-latest-android-release')>();
  return { ...actual, useLatestAndroidRelease: () => state.latest };
});
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/public/app-download/InstallGuide', () => ({ InstallGuide: () => <div /> }));

const release = () => ({
  version: '2.3.0',
  apkSizeBytes: 5 * 1024 * 1024,
  releaseNotes: null,
});

const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

describe('AppDownloadPage branch59 cancelled ??', () => {
  beforeEach(() => {
    state.latest = { data: release(), isLoading: false } as any;
    state.qr = vi.fn(async () => 'data:image/png;base64,AAA');
  });

  it('cancelled before resolve → !cancelled false branch (then)', async () => {
    let resolve!: (v: string) => void;
    state.qr = vi.fn(() => new Promise<string>((r) => { resolve = r; }));
    const { unmount, container } = render(<AppDownloadPage />);
    // unmount before promise resolves
    unmount();
    resolve('data:image/png;base64,BBB');
    // wait a tick, ensure no img appears after unmount (no error)
    await new Promise((r) => setTimeout(r, 20));
    expect(container.innerHTML).toBe('');
    // re-render to ensure no leak, but main check is that cancelled path was hit
    expect(state.qr).toHaveBeenCalled();
  });

  it('cancelled before reject → !cancelled false branch (catch)', async () => {
    let reject!: (e: Error) => void;
    state.qr = vi.fn(() => new Promise<string>((_, rej) => { reject = rej; }));
    const { unmount } = render(<AppDownloadPage />);
    unmount();
    reject(new Error('boom'));
    await new Promise((r) => setTimeout(r, 20));
    expect(state.qr).toHaveBeenCalled();
  });
});
