import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppReleaseCreateForm } from './AppReleaseCreateForm';

const state = vi.hoisted(() => ({
  upload: vi.fn(),
  create: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/ui/switch', async () => ({
  Switch: (await import('../../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

const meta = { apkPath: 'releases/app.apk', apkSha256: 'a'.repeat(64), apkSizeBytes: 2048 };

const renderForm = (over: Record<string, unknown> = {}) =>
  render(
    <AppReleaseCreateForm
      uploading={false}
      creating={false}
      onUpload={state.upload}
      onCreate={state.create}
      {...over}
    />,
  );

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;
const chooseFile = () =>
  fireEvent.change(fileInput(), {
    target: { files: [new File(['apk'], 'app.apk', { type: 'application/vnd.android.package-archive' })] },
  });
const uploadButton = () => screen.getByRole('button', { name: 'admin.releases.uploadApk' });
const createButton = () => screen.getByRole('button', { name: 'Kreiraj draft' });

beforeEach(() => {
  state.upload.mockReset();
  state.upload.mockResolvedValue(meta);
  state.create.mockReset();
  state.create.mockResolvedValue(undefined);
});

describe('AppReleaseCreateForm — upload APK-a', () => {
  it('dugme za upload traži fajl', () => {
    renderForm();
    expect(screen.getByText('admin.releases.new')).toBeInTheDocument();
    expect(uploadButton()).toBeDisabled();
    expect(createButton()).toBeDisabled();
  });

  it('nakon izbora fajla upload nosi taj fajl i prikazuje meta podatke', async () => {
    const user = userEvent.setup();
    renderForm();
    chooseFile();
    await user.click(uploadButton());
    expect(state.upload).toHaveBeenCalledTimes(1);
    expect((state.upload.mock.calls[0][0] as File).name).toBe('app.apk');
    expect(await screen.findByText(`SHA256 ${'a'.repeat(16)}… · 2048 B`)).toBeInTheDocument();
  });

  it('dok upload traje dugme je onemogućeno i mijenja tekst', () => {
    renderForm({ uploading: true });
    chooseFile();
    expect(screen.getByRole('button', { name: 'admin.releases.uploading' })).toBeDisabled();
  });

  it('greška uploada prikazuje poruku iz Error objekta', async () => {
    const user = userEvent.setup();
    state.upload.mockRejectedValue(new Error('APK je preveliki'));
    renderForm();
    chooseFile();
    await user.click(uploadButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('APK je preveliki');
    expect(screen.queryByText(/SHA256/)).toBeNull();
  });

  it('nepoznata greška uploada koristi rezervnu poruku', async () => {
    const user = userEvent.setup();
    state.upload.mockRejectedValue('pad');
    renderForm();
    chooseFile();
    await user.click(uploadButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('Upload APK-a nije uspio.');
  });
});

describe('AppReleaseCreateForm — kreiranje izdanja', () => {
  it('kreiranje je onemogućeno bez uploada i bez verzije', async () => {
    const user = userEvent.setup();
    renderForm();
    expect(createButton()).toBeDisabled();
    chooseFile();
    await user.click(uploadButton());
    await screen.findByText(/SHA256/);
    expect(createButton()).toBeDisabled();
    await user.type(screen.getByPlaceholderText('admin.releases.version'), '1.2.0');
    expect(createButton()).toBeEnabled();
  });

  it('šalje brojeve, izostavlja prazne napomene i resetuje formu', async () => {
    const user = userEvent.setup();
    renderForm();
    chooseFile();
    await user.click(uploadButton());
    await screen.findByText(/SHA256/);
    await user.type(screen.getByPlaceholderText('admin.releases.version'), '1.2.0');
    fireEvent.change(screen.getByPlaceholderText('admin.releases.versionCode'), {
      target: { value: '12' },
    });
    fireEvent.change(screen.getByPlaceholderText('admin.releases.minVersionCode'), {
      target: { value: '8' },
    });
    await user.click(createButton());
    await waitFor(() => expect(state.create).toHaveBeenCalledTimes(1));
    expect(state.create).toHaveBeenCalledWith({
      version: '1.2.0',
      versionCode: 12,
      minSupportedVersionCode: 8,
      forceUpdate: false,
      ...meta,
      releaseNotes: undefined,
    });
    await waitFor(() => expect(screen.queryByText(/SHA256/)).toBeNull());
    expect(fileInput().value).toBe('');
    expect(screen.getByPlaceholderText('admin.releases.version')).toHaveValue('');
  });

  it('prenosi napomenu i prinudno ažuriranje', async () => {
    const user = userEvent.setup();
    renderForm();
    chooseFile();
    await user.click(uploadButton());
    await screen.findByText(/SHA256/);
    await user.type(screen.getByPlaceholderText('admin.releases.version'), '2.0.0');
    await user.type(screen.getByPlaceholderText('admin.releases.notes'), 'Nove funkcije');
    await user.click(screen.getByRole('switch'));
    await user.click(createButton());
    await waitFor(() => expect(state.create).toHaveBeenCalledTimes(1));
    expect(state.create.mock.calls[0][0]).toMatchObject({
      version: '2.0.0',
      versionCode: 1,
      forceUpdate: true,
      releaseNotes: 'Nove funkcije',
    });
  });

  it('greška kreiranja prikazuje poruku i ne resetuje formu', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValue(new Error('Verzija već postoji'));
    renderForm();
    chooseFile();
    await user.click(uploadButton());
    await screen.findByText(/SHA256/);
    await user.type(screen.getByPlaceholderText('admin.releases.version'), '1.0.0');
    await user.click(createButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('Verzija već postoji');
    expect(screen.getByText(/SHA256/)).toBeInTheDocument();
  });

  it('nepoznata greška kreiranja koristi prevedenu rezervnu poruku', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValue({ status: 500 });
    renderForm();
    chooseFile();
    await user.click(uploadButton());
    await screen.findByText(/SHA256/);
    await user.type(screen.getByPlaceholderText('admin.releases.version'), '1.0.1');
    await user.click(createButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('admin.releases.createError');
  });

  it('dok kreiranje traje dugme je onemogućeno', async () => {
    const user = userEvent.setup();
    const { rerender } = renderForm();
    chooseFile();
    await user.click(uploadButton());
    await screen.findByText(/SHA256/);
    await user.type(screen.getByPlaceholderText('admin.releases.version'), '3.0.0');
    rerender(
      <AppReleaseCreateForm
        uploading={false}
        creating
        onUpload={state.upload}
        onCreate={state.create}
      />,
    );
    expect(screen.getByRole('button', { name: 'Spremanje…' })).toBeDisabled();
  });
});
