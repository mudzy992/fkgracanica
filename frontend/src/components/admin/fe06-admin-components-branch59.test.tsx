import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('AdminPagination branch59 if meta.totalPages <=1', () => {
  it('totalPages 1 → return null (if true)', async () => {
    const { AdminPagination } = await import('./AdminPagination');
    const { container } = render(<MemoryRouter><AdminPagination meta={{ totalPages: 1 } as any} page={1} onPageChange={vi.fn()} /></MemoryRouter>);
    expect(container.innerHTML).toBe('');
  });
  it('totalPages 2 → render (if false)', async () => {
    const { AdminPagination } = await import('./AdminPagination');
    const { container } = render(<MemoryRouter><AdminPagination meta={{ totalPages: 2 } as any} page={1} onPageChange={vi.fn()} /></MemoryRouter>);
    expect(container.innerHTML).not.toBe('');
  });
});

describe('CustomHtmlEditor branch59 selected || tekst', () => {
  it('empty selection → fallback tekst', async () => {
    const { CustomHtmlEditor } = await import('./CustomHtmlEditor');
    const onChange = vi.fn();
    const { container } = render(<CustomHtmlEditor value="hello" onChange={onChange} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    // no selection (0,0) → inner should be 'tekst'
    textarea.focus();
    textarea.setSelectionRange(0, 0);
    const btn = screen.getByRole('button', { name: 'H2' });
    btn.click();
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('tekst'));
  });
  it('with selection → uses selected text', async () => {
    const { CustomHtmlEditor } = await import('./CustomHtmlEditor');
    const onChange = vi.fn();
    const { container } = render(<CustomHtmlEditor value="hello" onChange={onChange} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(0, 5);
    const btn = screen.getByRole('button', { name: 'Bold' });
    btn.click();
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('hello'));
  });
});
