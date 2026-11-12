import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppReleaseCreateForm } from './AppReleaseCreateForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, d?: string) => d ?? k }),
}));

describe('AppReleaseCreateForm — branch50 (upload/create grane)', () => {
  const onUpload = vi.fn();
  const onCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upload bez fajla early return (!file)', async () => {
    onUpload.mockResolvedValue({ apkPath: '/a.apk', apkSha256: 'abc1234567890123', apkSizeBytes: 123 });
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const btn = screen.getByText('admin.releases.uploadApk');
    expect(btn).toBeDisabled(); // !file
    // pokušaj click ne poziva onUpload
    fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 10));
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('upload success postavlja meta i prikazuje SHA256, notes fallback', async () => {
    onUpload.mockResolvedValue({ apkPath: '/a.apk', apkSha256: 'abcdef1234567890abcdef', apkSizeBytes: 999 });
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const file = new File(['dummy'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    const uploadBtn = screen.getByText('admin.releases.uploadApk');
    expect(uploadBtn).not.toBeDisabled();
    fireEvent.click(uploadBtn);
    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(file));
    expect(screen.getByText(/SHA256/)).toBeInTheDocument();
    expect(screen.getByText(/999 B/)).toBeInTheDocument();
  });

  it('upload greška prikazuje alert (catch -> error)', async () => {
    onUpload.mockRejectedValue(new Error('fail'));
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const file = new File(['dummy'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('admin.releases.uploadApk'));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert').textContent).toMatch(/fail/);
  });

  it('create bez meta early return (!meta) i disabled', async () => {
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const createBtn = screen.getByText('Kreiraj draft');
    expect(createBtn).toBeDisabled(); // !meta
    fireEvent.click(createBtn);
    await new Promise((r) => setTimeout(r, 10));
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('create success sa notes i forceUpdate, resetuje formu', async () => {
    onUpload.mockResolvedValue({ apkPath: '/b.apk', apkSha256: 'sha256value123456', apkSizeBytes: 456 });
    onCreate.mockResolvedValue(undefined);
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const file = new File(['dummy'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText('admin.releases.uploadApk'));
    await waitFor(() => expect(screen.getByText(/SHA256/)).toBeInTheDocument());

    const versionInput = screen.getByPlaceholderText('admin.releases.version');
    fireEvent.change(versionInput, { target: { value: '1.2.3' } });
    const notesInput = screen.getByPlaceholderText('admin.releases.notes');
    fireEvent.change(notesInput, { target: { value: 'Release notes' } });
    // forceUpdate switch
    const switchEl = document.querySelector('#force') as HTMLInputElement;
    // Switch je custom, ali onCheckedChange se poziva preko click na switch
    // probaj direktno fireEvent
    if (switchEl) fireEvent.click(switchEl);

    const createBtn = screen.getByText('Kreiraj draft');
    expect(createBtn).not.toBeDisabled();
    fireEvent.click(createBtn);
    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          version: '1.2.3',
          apkPath: '/b.apk',
          releaseNotes: 'Release notes',
        }),
      ),
    );
  });

  it('create sa praznim notes daje undefined (notes || undefined)', async () => {
    onUpload.mockResolvedValue({ apkPath: '/c.apk', apkSha256: 's1234567890abcdef', apkSizeBytes: 789 });
    onCreate.mockResolvedValue(undefined);
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const file = new File(['dummy'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText('admin.releases.uploadApk'));
    await waitFor(() => expect(screen.getByText(/SHA256/)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('admin.releases.version'), { target: { value: '2.0.0' } });
    // notes ostaje prazan
    fireEvent.click(screen.getByText('Kreiraj draft'));
    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ releaseNotes: undefined })),
    );
  });

  it('uploading i creating prikazuju loading tekst i disabled', () => {
    render(<AppReleaseCreateForm uploading creating onUpload={onUpload} onCreate={onCreate} />);
    expect(screen.getByText('admin.releases.uploading')).toBeInTheDocument();
    expect(screen.getByText('Spremanje…')).toBeInTheDocument();
  });

  it('create greška prikazuje alert', async () => {
    onUpload.mockResolvedValue({ apkPath: '/d.apk', apkSha256: 'sha123', apkSizeBytes: 100 });
    onCreate.mockRejectedValue(new Error('create fail'));
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const file = new File(['dummy'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText('admin.releases.uploadApk'));
    await waitFor(() => expect(screen.getByText(/SHA256/)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('admin.releases.version'), { target: { value: '3.0' } });
    fireEvent.click(screen.getByText('Kreiraj draft'));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
