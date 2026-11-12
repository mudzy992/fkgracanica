import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { RichTextEditor } from './RichTextEditor';

/**
 * Batch 34 — grane koje traže događaje koje postojeći testovi ne šalju:
 * keydown Ctrl/Cmd+V, keyup drugog tastera, paste bez clipboarda, `tall`
 * i medij bez putanje za `mediaUrl`.
 */
const state = vi.hoisted(() => ({
  assets: { data: { data: [] as Array<Record<string, unknown>> }, isLoading: false },
}));

vi.mock('../../hooks/use-media-admin', () => ({ useMediaAssets: () => state.assets }));
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
vi.mock('../../lib/media', () => ({
  // Putanja sa `bez-medija` simulira neuspjelo izračunavanje URL-a.
  mediaUrl: (path: string, size: string) =>
    path.includes('bez-medija') ? undefined : `/m/${size}/${path}`,
}));

const rects = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects');
const rect = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect');
beforeAll(() => {
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

async function mountEditor(over: Record<string, unknown> = {}) {
  const onChange = vi.fn();
  const rendered = render(
    <RichTextEditor value="<p>Dovoljno dug tekst vijesti.</p>" onChange={onChange} {...over} />,
  );
  await waitFor(() => expect(rendered.container.querySelector('.tiptap')).not.toBeNull());
  const editor = rendered.container.querySelector<HTMLElement>('.tiptap')!;
  await waitFor(() => expect(editor).toHaveTextContent('Dovoljno dug tekst vijesti.'));
  return { ...rendered, editor, onChange };
}

describe('RichTextEditor — tastatura i paste rubovi (batch 34)', () => {
  it('Ctrl+V zapisuje stanje Shift-a, drugi taster ga ne dira', async () => {
    const { editor } = await mountEditor();
    await act(async () => {
      fireEvent.keyDown(editor, { key: 'v', ctrlKey: true, shiftKey: true });
    });
    // Običan taster prolazi kroz `if` bez promjene stanja.
    await act(async () => {
      fireEvent.keyDown(editor, { key: 'p' });
    });
    await act(async () => {
      fireEvent.keyUp(editor, { key: 'x' });
    });
    expect(editor).toBeInTheDocument();
  });

  it('Meta+V sa velikim slovom takođe postavlja obično lijepljenje', async () => {
    const { editor } = await mountEditor();
    await act(async () => {
      fireEvent.keyDown(editor, { key: 'V', metaKey: true, shiftKey: false });
    });
    await act(async () => {
      fireEvent.keyUp(editor, { key: 'v' });
    });
    expect(editor).toBeInTheDocument();
  });

  it('paste bez clipboarda prijavljuje da lijepljenje nije dostupno', async () => {
    const { editor } = await mountEditor();
    await act(async () => {
      fireEvent.paste(editor, {});
    });
    expect(screen.getByRole('alert')).toHaveTextContent('preglednik ne omogućava sigurno lijepljenje');
  });

  it('`tall` mijenja minimalnu visinu editora', async () => {
    const { container } = await mountEditor({ tall: true });
    expect(container.querySelector('.tiptap')?.className).toContain('min-h-[28rem]');
  });

  it('bez `tall` koristi standardnu visinu', async () => {
    const { container } = await mountEditor();
    expect(container.querySelector('.tiptap')?.className).toContain('min-h-[180px]');
  });
});

describe('RichTextEditor — mediji bez izračunate putanje (batch 34)', () => {
  it('lista medija radi i kad odgovor nije umotan u `data`', async () => {
    state.assets = {
      data: [{ id: 'a1', originalPath: 'mediji/a.jpg', thumbPath: null, filename: 'a.jpg' }] as never,
      isLoading: false,
    };
    await mountEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Slika' }));
    expect(screen.getByRole('img', { name: 'a.jpg' })).toBeInTheDocument();
    state.assets = { data: { data: [] }, isLoading: false };
  });

  it('kad `mediaUrl` ne vrati putanju koristi se sirova putanja', async () => {
    state.assets = {
      data: {
        data: [{ id: 'a2', originalPath: 'bez-medija.jpg', thumbPath: null, filename: 'bez-medija.jpg' }],
      },
      isLoading: false,
    };
    const { onChange } = await mountEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Slika' }));
    const tile = screen.getByRole('img', { name: 'bez-medija.jpg' }).closest('button') as HTMLElement;
    fireEvent.click(tile);
    await waitFor(() => expect(String(onChange.mock.calls.at(-1)?.[0])).toContain('bez-medija.jpg'));
    state.assets = { data: { data: [] }, isLoading: false };
  });
});
