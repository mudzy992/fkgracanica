import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RichTextToolbar } from './RichTextToolbar';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const ID = 'dQw4w9WgXcQ';

const chain = {
  focus: vi.fn(),
  run: vi.fn(),
  toggleBold: vi.fn(),
  toggleItalic: vi.fn(),
  toggleUnderline: vi.fn(),
  toggleHeading: vi.fn(),
  toggleBulletList: vi.fn(),
  toggleOrderedList: vi.fn(),
  toggleBlockquote: vi.fn(),
  setHorizontalRule: vi.fn(),
  extendMarkRange: vi.fn(),
  setLink: vi.fn(),
  unsetLink: vi.fn(),
  setYoutubeVideo: vi.fn(),
};
for (const key of Object.keys(chain) as Array<keyof typeof chain>) {
  if (key !== 'run') chain[key].mockImplementation(() => chain);
}

const editor = {
  chain: vi.fn(() => chain),
  getAttributes: vi.fn((..._a: unknown[]) => ({}) as Record<string, unknown>),
  isActive: vi.fn((..._a: unknown[]) => false),
};

const renderToolbar = (onInsertImage = vi.fn()) => {
  render(<RichTextToolbar editor={editor as never} onInsertImage={onInsertImage} />);
  return onInsertImage;
};

const button = (label: string) => screen.getByRole('button', { name: label });

beforeEach(() => {
  vi.clearAllMocks();
  editor.getAttributes.mockReturnValue({});
  editor.isActive.mockReturnValue(false);
  for (const key of Object.keys(chain) as Array<keyof typeof chain>) {
    if (key !== 'run') chain[key].mockImplementation(() => chain);
  }
});

describe('RichTextToolbar — formatiranje', () => {
  it('prikazuje sve alatke', () => {
    renderToolbar();
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'B',
      'I',
      'U',
      'H2',
      'H3',
      '•',
      '1.',
      '❝',
      '—',
      'Link',
      'Slika',
      'Video',
    ]);
  });

  it('primjenjuje podebljano, kurziv i podvučeno', async () => {
    renderToolbar();
    await userEvent.click(button('B'));
    await userEvent.click(button('I'));
    await userEvent.click(button('U'));
    expect(chain.toggleBold).toHaveBeenCalled();
    expect(chain.toggleItalic).toHaveBeenCalled();
    expect(chain.toggleUnderline).toHaveBeenCalled();
    expect(chain.run).toHaveBeenCalledTimes(3);
  });

  it('naslovi H2 i H3 koriste odgovarajući nivo', async () => {
    renderToolbar();
    await userEvent.click(button('H2'));
    expect(chain.toggleHeading).toHaveBeenLastCalledWith({ level: 2 });
    await userEvent.click(button('H3'));
    expect(chain.toggleHeading).toHaveBeenLastCalledWith({ level: 3 });
  });

  it('liste, citat i linija se primjenjuju', async () => {
    renderToolbar();
    await userEvent.click(button('•'));
    await userEvent.click(button('1.'));
    await userEvent.click(button('❝'));
    await userEvent.click(button('—'));
    expect(chain.toggleBulletList).toHaveBeenCalled();
    expect(chain.toggleOrderedList).toHaveBeenCalled();
    expect(chain.toggleBlockquote).toHaveBeenCalled();
    expect(chain.setHorizontalRule).toHaveBeenCalled();
  });

  it('aktivna alatka dobija primarni stil, neaktivna outline', () => {
    editor.isActive.mockImplementation((name: unknown) => name === 'bold');
    renderToolbar();
    expect(button('B').className).toContain('bg-primary');
    expect(button('I').className).not.toContain('bg-primary');
  });

  it('aktivna lista i citat reflektuju stanje editora', () => {
    editor.isActive.mockImplementation((name: unknown) =>
      ['bulletList', 'blockquote'].includes(String(name)),
    );
    renderToolbar();
    expect(button('•').className).toContain('bg-primary');
    expect(button('❝').className).toContain('bg-primary');
    expect(button('1.').className).not.toContain('bg-primary');
    expect(editor.isActive).toHaveBeenCalledWith('heading', { level: 2 });
  });
});

describe('RichTextToolbar — link', () => {
  it('postavlja link iz prompta', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://primjer.test');
    renderToolbar();
    await userEvent.click(button('Link'));
    expect(prompt).toHaveBeenCalledWith('URL linka:', 'https://');
    expect(chain.extendMarkRange).toHaveBeenCalledWith('link');
    expect(chain.setLink).toHaveBeenCalledWith({ href: 'https://primjer.test' });
  });

  it('koristi postojeći href kao podrazumijevanu vrijednost', async () => {
    editor.getAttributes.mockReturnValue({ href: 'https://stari.test' });
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://novi.test');
    renderToolbar();
    await userEvent.click(button('Link'));
    expect(prompt).toHaveBeenCalledWith('URL linka:', 'https://stari.test');
    expect(chain.setLink).toHaveBeenCalledWith({ href: 'https://novi.test' });
  });

  it('prazan unos uklanja link', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('');
    renderToolbar();
    await userEvent.click(button('Link'));
    expect(chain.unsetLink).toHaveBeenCalled();
    expect(chain.setLink).not.toHaveBeenCalled();
  });

  it('otkazani prompt ne mijenja dokument', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue(null);
    renderToolbar();
    await userEvent.click(button('Link'));
    expect(chain.setLink).not.toHaveBeenCalled();
    expect(chain.unsetLink).not.toHaveBeenCalled();
  });
});

describe('RichTextToolbar — slika i video', () => {
  it('slika poziva dijalog medija', async () => {
    const onInsertImage = renderToolbar();
    await userEvent.click(button('Slika'));
    expect(onInsertImage).toHaveBeenCalledTimes(1);
  });

  it('ispravan YouTube link ubacuje video bez greške', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue(`https://youtu.be/${ID}`);
    renderToolbar();
    await userEvent.click(button('Video'));
    expect(chain.setYoutubeVideo).toHaveBeenCalledWith({
      src: `https://www.youtube.com/embed/${ID}`,
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('neispravan link prikazuje grešku i ne ubacuje video', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('https://example.com/x');
    renderToolbar();
    await userEvent.click(button('Video'));
    expect(chain.setYoutubeVideo).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('video.editorInvalidInput');
  });

  it('greška se uklanja sljedećim ispravnim unosom', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('nije-link');
    renderToolbar();
    await userEvent.click(button('Video'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    prompt.mockReturnValue(`https://www.youtube.com/watch?v=${ID}`);
    await userEvent.click(button('Video'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('otkazani prompt ne ubacuje ništa', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue(null);
    renderToolbar();
    await userEvent.click(button('Video'));
    expect(chain.setYoutubeVideo).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
