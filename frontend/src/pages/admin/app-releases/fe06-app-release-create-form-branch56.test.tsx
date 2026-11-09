import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppReleaseCreateForm } from './AppReleaseCreateForm';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('fe06 AppReleaseCreateForm branch56', () => {
  it('if (!file) return → file null ne poziva onUpload', async () => {
    const onUpload = vi.fn(async () => ({ apkPath: 'a', apkSha256: 'b', apkSizeBytes: 1 }));
    const onCreate = vi.fn(async () => {});
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const uploadBtn = screen.getByRole('button', { name: /uploadApk|admin.releases.uploadApk/ });
    // button disabled when !file, remove disabled and click to hit early return
    (uploadBtn as HTMLButtonElement).disabled = false;
    uploadBtn.removeAttribute('disabled');
    fireEvent.click(uploadBtn);
    // should not have called onUpload because file is null and handleUpload early returns
    expect(onUpload).not.toHaveBeenCalled();
  });
  it('if (!meta) return → meta null ne poziva onCreate', async () => {
    const onUpload = vi.fn(async () => ({ apkPath: 'a', apkSha256: 'b', apkSizeBytes: 1 }));
    const onCreate = vi.fn(async () => {});
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const createBtn = screen.getByRole('button', { name: /Kreiraj draft/ });
    (createBtn as HTMLButtonElement).disabled = false;
    createBtn.removeAttribute('disabled');
    fireEvent.click(createBtn);
    expect(onCreate).not.toHaveBeenCalled();
  });
  it('files?.[0] ?? null fallback when files null', async () => {
    const onUpload = vi.fn(async () => ({ apkPath: 'a', apkSha256: 'b', apkSizeBytes: 1 }));
    const onCreate = vi.fn(async () => {});
    render(<AppReleaseCreateForm uploading={false} creating={false} onUpload={onUpload} onCreate={onCreate} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    // simulate change with files = null (no file selected) -> e.target.files?.[0] ?? null should hit null fallback
    fireEvent.change(input, { target: { files: null } });
    // file should remain null, so upload still disabled
    const uploadBtn = screen.getByRole('button', { name: /uploadApk|admin.releases.uploadApk/ });
    expect(uploadBtn.hasAttribute('disabled')).toBe(true);
  });
});
