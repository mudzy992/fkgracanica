import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RichTextEditor } from './RichTextEditor';

const state = vi.hoisted(() => ({
  assets: { data: { data: [] as Array<Record<string, unknown>> }, isLoading: false },
}));

vi.mock('react-i18next', async (io) => ({
  ...(await io<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (k: string) => `t:${k}` }),
}));
vi.mock('../../hooks/use-media-admin', () => ({ useMediaAssets: () => state.assets }));
vi.mock('../../lib/media', () => ({ mediaUrl: (p: string, size: string) => `/m/${size}/${p}` }));
vi.mock('../ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogHeader: ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div>
      {children}
      <button onClick={onClose}>zatvori</button>
    </div>
  ),
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderEditor = (over: Record<string, unknown> = {}) => {
  const onChange = vi.fn();
  const utils = render(<RichTextEditor value="<p>Prvi</p>" onChange={onChange} {...over} />);
  return { ...utils, onChange };
};

beforeEach(() => {
  state.assets = { data: { data: [] }, isLoading: false };
  vi.restoreAllMocks();
});

const waitForEditor = async () => {
  await waitFor(() => expect(document.querySelector('[contenteditable="true"]')).not.toBeNull());
};

describe('RichTextEditor — osnovni prikaz', () => {
  it('prikazuje toolbar i sadržaj bez media dijaloga', async () => {
    renderEditor();
    await waitForEditor();
    expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
    expect(screen.queryByTestId('dialog')).toBeNull();
    expect(document.querySelector('[contenteditable="true"]')?.textContent).toBe('Prvi');
  });

  it('prazna vrijednost se prikazuje kao prazan pasus', async () => {
    renderEditor({ value: '' });
    await waitForEditor();
    expect(document.querySelector('[contenteditable="true"]')?.textContent).toBe('');
  });

  it('vanjska promjena vrijednosti zamjenjuje sadržaj bez emisije', async () => {
    const { onChange, rerender } = renderEditor();
    await waitForEditor();
    rerender(<RichTextEditor value="<p>Drugi tekst</p>" onChange={onChange} />);
    await waitFor(() =>
      expect(document.querySelector('[contenteditable="true"]')?.textContent).toBe('Drugi tekst'),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('iste vrijednosti ne resetuju editor', async () => {
    const { onChange, rerender } = renderEditor();
    await waitForEditor();
    rerender(<RichTextEditor value="<p>Prvi</p>" onChange={onChange} />);
    expect(document.querySelector('[contenteditable="true"]')?.textContent).toBe('Prvi');
  });
});

describe('RichTextEditor — toolbar akcije', () => {
  it('sva dugmad toolbara su dostupna i klik ih izvršava bez greške', async () => {
    renderEditor();
    await waitForEditor();
    for (const name of ['B', 'I', 'U', 'H2', 'H3', '•', '1.', '❝', '—']) {
      await userEvent.click(screen.getByRole('button', { name }));
    }
    expect(document.querySelector('[contenteditable="true"]')).not.toBeNull();
  });

  it('link se postavlja kroz prompt i uklanja praznim unosom', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://fkgracanica.ba');
    renderEditor();
    await waitForEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Link' }));
    expect(prompt).toHaveBeenCalledWith('URL linka:', 'https://');
    prompt.mockReturnValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Link' }));
    expect(prompt).toHaveBeenCalledTimes(2);
  });

  it('otkazani prompt ne mijenja ništa', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null);
    renderEditor();
    await waitForEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Link' }));
    await userEvent.click(screen.getByRole('button', { name: 'Video' }));
    expect(prompt).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('neispravan YouTube link prikazuje grešku, ispravan je uklanja', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com/x');
    renderEditor();
    await waitForEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Video' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('t:video.editorInvalidInput');
    prompt.mockReturnValue('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await userEvent.click(screen.getByRole('button', { name: 'Video' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});

describe('RichTextEditor — dijalog medija', () => {
  it('prikazuje učitavanje i praznu listu', async () => {
    state.assets = { data: { data: [] }, isLoading: true };
    renderEditor();
    await waitForEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Slika' }));
    expect(screen.getByText('t:admin.common.loading')).toBeInTheDocument();
  });

  it('klik na sliku ubacuje je i zatvara dijalog', async () => {
    state.assets = {
      data: { data: [{ id: 'a1', originalPath: 'mediji/a.jpg', thumbPath: null, filename: 'a.jpg' }] },
      isLoading: false,
    };
    const { onChange } = renderEditor();
    await waitForEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Slika' }));
    const tile = screen.getByRole('img', { name: 'a.jpg' }).closest('button') as HTMLElement;
    await userEvent.click(tile);
    expect(screen.queryByTestId('dialog')).toBeNull();
    await waitFor(() => expect(String(onChange.mock.calls.at(-1)?.[0])).toContain('img'));
  });

  it('URL slike se dodaje kroz prompt i bez unosa se preskače', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://cdn/x.jpg');
    renderEditor();
    await waitForEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Slika' }));
    await userEvent.click(screen.getByRole('button', { name: 'URL slike' }));
    expect(prompt).toHaveBeenCalledWith('URL slike:', 'https://');
    prompt.mockReturnValue('   ');
    await userEvent.click(screen.getByRole('button', { name: 'Slika' }));
    await userEvent.click(screen.getByRole('button', { name: 'URL slike' }));
    expect(prompt).toHaveBeenCalledTimes(2);
  });

  it('zatvaranje dijaloga klikom na zaglavlje', async () => {
    renderEditor();
    await waitForEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Slika' }));
    await userEvent.click(screen.getByRole('button', { name: 'zatvori' }));
    expect(screen.queryByTestId('dialog')).toBeNull();
  });
});
