import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CustomHtmlEditor } from './CustomHtmlEditor';

describe('CustomHtmlEditor', () => {
  it('prikazuje sva dugmad alata i trenutnu vrijednost', () => {
    render(<CustomHtmlEditor value="<p>tekst</p>" onChange={vi.fn()} />);
    for (const label of ['H2', 'H3', 'P', 'Bold', 'Italic', 'Link', 'UL', 'BR', 'Div']) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('<p>tekst</p>');
  });

  it('kucanje prosljeđuje novi HTML', async () => {
    function Harness() {
      const [html, setHtml] = useState('');
      return <CustomHtmlEditor value={html} onChange={setHtml} />;
    }
    render(<Harness />);
    await userEvent.type(screen.getByRole('textbox'), 'ab');
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('ab');
  });

  it('bez selekcije umotava rezervni tekst', async () => {
    const onChange = vi.fn();
    render(<CustomHtmlEditor value="" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onChange).toHaveBeenCalledWith('<strong>tekst</strong>');
  });

  it('umotava označeni dio teksta', async () => {
    const onChange = vi.fn();
    render(<CustomHtmlEditor value="amar hodzic" onChange={onChange} />);
    const area = screen.getByRole('textbox') as HTMLTextAreaElement;
    area.focus();
    area.setSelectionRange(0, 4);
    await userEvent.click(screen.getByRole('button', { name: 'H2' }));
    expect(onChange).toHaveBeenCalledWith('<h2>amar</h2> hodzic');
  });

  it('BR umotava bez zatvaranja', async () => {
    const onChange = vi.fn();
    render(<CustomHtmlEditor value="" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'BR' }));
    expect(onChange).toHaveBeenCalledWith('<br />tekst');
  });

  it('lista se umotava u UL okvir', async () => {
    const onChange = vi.fn();
    render(<CustomHtmlEditor value="" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'UL' }));
    expect(onChange).toHaveBeenCalledWith('<ul><li>tekst</li></ul>');
  });

  it('link dobija prazan href', async () => {
    const onChange = vi.fn();
    render(<CustomHtmlEditor value="" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Link' }));
    expect(onChange).toHaveBeenCalledWith('<a href="">tekst</a>');
  });

  it('tekstarea ima 14 redova i nema provjeru pravopisa', () => {
    render(<CustomHtmlEditor value="" onChange={vi.fn()} />);
    const area = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(area.rows).toBe(14);
    expect(area.getAttribute('spellcheck')).toBe('false');
    expect(area.getAttribute('placeholder')).toBe('<div>...</div>');
  });
});
