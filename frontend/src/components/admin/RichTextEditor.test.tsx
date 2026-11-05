import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { RichTextEditor } from './RichTextEditor';

vi.mock('../../hooks/use-media-admin', () => ({
  useMediaAssets: () => ({ data: { data: [] }, isLoading: false }),
}));

const rects = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects');
const rect = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect');
beforeAll(() => {
  // jsdom has no layout; ProseMirror asks for these while scrolling a paste into view.
  Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [] });
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(),
  });
});
afterAll(() => {
  if (rects) Object.defineProperty(Range.prototype, 'getClientRects', rects);
  else Reflect.deleteProperty(Range.prototype, 'getClientRects');
  if (rect) Object.defineProperty(Range.prototype, 'getBoundingClientRect', rect);
  else Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
});

async function mountEditor() {
  const onChange = vi.fn();
  const rendered = render(<RichTextEditor value="<p>Dovoljno dug tekst vijesti.</p>" onChange={onChange} />);
  await waitFor(() => expect(rendered.container.querySelector('.tiptap')).not.toBeNull());
  const editor = rendered.container.querySelector<HTMLElement>('.tiptap')!;
  await waitFor(() => expect(editor).toHaveTextContent('Dovoljno dug tekst vijesti.'));
  return { ...rendered, editor, onChange };
}

function paste(editor: HTMLElement, content: Record<string, string>) {
  const clipboardData = { getData: (type: string) => content[type] ?? '' };
  fireEvent.paste(editor, { clipboardData });
}

describe('RichTextEditor paste selection', () => {
  it('uskladi fokusiranu DOM selekciju prije pastea i sačuva tekst', async () => {
    const { editor, onChange } = await mountEditor();
    editor.focus();
    const text = editor.querySelector('p')!.firstChild!;
    const selection = window.getSelection()!;
    selection.collapse(text, text.textContent!.length);
    const dispatch = vi.spyOn(document, 'dispatchEvent');
    await act(async () => paste(editor, { 'text/plain': ' Dodano' }));
    expect(dispatch.mock.calls.some(([event]) => event.type === 'selectionchange')).toBe(true);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(String(onChange.mock.lastCall?.[0])).toContain('Dodano');
  });

  it('sanitizira zalijepljeni HTML iframe i sprema siguran sadržaj', async () => {
    const { editor, onChange } = await mountEditor();
    editor.focus();
    const text = editor.querySelector('p')!.firstChild!;
    window.getSelection()!.collapse(text, text.textContent!.length);
    await act(async () => paste(editor, {
      'text/html': '<iframe src="https://www.youtube.com/embed/abc123XYZ01" onload="alert(1)"></iframe>',
      'text/plain': 'https://youtu.be/abc123XYZ01',
    }));
    const saved = String(onChange.mock.lastCall?.[0]);
    expect(saved).toContain('https://www.youtube.com/embed/abc123XYZ01');
    expect(saved).not.toContain('onload');
  });

  it('Shift+paste koristi običan tekst čak i kada clipboard sadrži HTML', async () => {
    const { editor, onChange } = await mountEditor();
    editor.focus();
    const text = editor.querySelector('p')!.firstChild!;
    window.getSelection()!.collapse(text, text.textContent!.length);
    fireEvent.keyDown(editor, { key: 'v', ctrlKey: true, shiftKey: true });
    await act(async () => paste(editor, {
      'text/html': '<iframe src="https://www.youtube.com/embed/abc123XYZ01"></iframe>',
      'text/plain': 'Običan tekst',
    }));
    expect(String(onChange.mock.lastCall?.[0])).toContain('Običan tekst');
    expect(editor.querySelector('iframe')).toBeNull();
  });

  it('ne lažira selekciju kada editor nema fokus', async () => {
    const { editor } = await mountEditor();
    const dispatch = vi.spyOn(document, 'dispatchEvent');
    await act(async () => paste(editor, {}));
    expect(dispatch.mock.calls.some(([event]) => event.type === 'selectionchange')).toBe(false);
    expect(screen.getByRole('alert')).toHaveTextContent('preglednik ne omogućava sigurno lijepljenje');
  });
});
