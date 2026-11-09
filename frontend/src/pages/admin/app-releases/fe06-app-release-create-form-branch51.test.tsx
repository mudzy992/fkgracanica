import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppReleaseCreateForm } from './AppReleaseCreateForm';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, d?: string) => d ?? k }) }));

describe('AppReleaseCreateForm — branch51 (early returns bypass)', () => {
  const onUpload = vi.fn();
  const onCreate = vi.fn();
  beforeEach(() => { vi.clearAllMocks(); onUpload.mockResolvedValue({ apkPath: '/a.apk', apkSha256: 'abc1234567890123', apkSizeBytes: 123 }); onCreate.mockResolvedValue(undefined); });

  it('handleUpload early return kada nema file (bypass disabled)', async () => {
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const btn = screen.getByText('admin.releases.uploadApk') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.removeAttribute('disabled');
    fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 10));
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('handleCreate early return kada nema meta (bypass disabled)', async () => {
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const btn = screen.getByText('Kreiraj draft') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.removeAttribute('disabled');
    fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 10));
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('releaseNotes fallback undefined kada notes prazan', async () => {
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const file = new File(['dummy'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText('admin.releases.uploadApk'));
    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(file));
    await waitFor(() => expect(screen.getByText(/SHA256/)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('admin.releases.version'), { target: { value: '2.0.0' } });
    fireEvent.click(screen.getByText('Kreiraj draft'));
    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ releaseNotes: undefined, version: '2.0.0' })));
  });

  it('releaseNotes proslijeđen kada ima vrijednost', async () => {
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const file = new File(['dummy'], 'app.apk', { type: 'application/vnd.android.package-archive' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText('admin.releases.uploadApk'));
    await waitFor(() => expect(screen.getByText(/SHA256/)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('admin.releases.version'), { target: { value: '3.0' } });
    fireEvent.change(screen.getByPlaceholderText('admin.releases.notes'), { target: { value: 'Moje bilješke' } });
    fireEvent.click(screen.getByText('Kreiraj draft'));
    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ releaseNotes: 'Moje bilješke' })));
  });
});
