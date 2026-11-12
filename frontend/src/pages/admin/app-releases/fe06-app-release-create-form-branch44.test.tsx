import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppReleaseCreateForm } from './AppReleaseCreateForm';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('AppReleaseCreateForm — branch44 (3 grane)', () => {
  it('if (!file) guard: klik na upload bez fajla ne zove onUpload', async () => {
    const onUpload = vi.fn(async () => ({ apkPath: 'a', apkSha256: 'x'.repeat(64), apkSizeBytes: 1 }));
    const onCreate = vi.fn(async () => {});
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const btn = screen.getByRole('button', { name: 'admin.releases.uploadApk' });
    expect(btn).toBeDisabled();
    // fireEvent bypasses disabled da pokrije granu if (!file) return
    fireEvent.click(btn);
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('if (!meta) guard: kreiraj bez meta ne zove onCreate', async () => {
    const onUpload = vi.fn(async () => ({ apkPath: 'a', apkSha256: 'x'.repeat(64), apkSizeBytes: 1 }));
    const onCreate = vi.fn(async () => {});
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const createBtn = screen.getByRole('button', { name: 'Kreiraj draft' });
    expect(createBtn).toBeDisabled();
    fireEvent.click(createBtn);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('meta display: prikazuje SHA256 isječak i veličinu', async () => {
    const meta = { apkPath: 'path/app.apk', apkSha256: 'a'.repeat(64), apkSizeBytes: 12345 };
    const onUpload = vi.fn(async () => meta);
    const onCreate = vi.fn(async () => {});
    const user = userEvent.setup();
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    await user.upload(input, file);
    const uploadBtn = screen.getByRole('button', { name: 'admin.releases.uploadApk' });
    await user.click(uploadBtn);
    await waitFor(() => expect(onUpload).toHaveBeenCalled());
    expect(await screen.findByText(new RegExp('SHA256'))).toBeInTheDocument();
    expect(screen.getByText(/12345 B/)).toBeInTheDocument();
  });

  it('notes fallback: prazne bilješke šalju undefined', async () => {
    const meta = { apkPath: 'p', apkSha256: 'b'.repeat(64), apkSizeBytes: 99 };
    const onUpload = vi.fn(async () => meta);
    const onCreate = vi.fn(async () => {});
    const user = userEvent.setup();
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'admin.releases.uploadApk' }));
    await waitFor(() => expect(onUpload).toHaveBeenCalled());
    await user.type(screen.getByPlaceholderText('admin.releases.version'), '1.2.3');
    // ostavi notes prazno
    await user.click(screen.getByRole('button', { name: 'Kreiraj draft' }));
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    const body = (onCreate.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(body.releaseNotes).toBeUndefined();
    expect(body.version).toBe('1.2.3');
  });
});
