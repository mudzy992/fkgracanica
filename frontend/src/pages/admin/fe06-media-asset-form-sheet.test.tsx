import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaAssetFormSheet } from './MediaAssetFormSheet';

const state = vi.hoisted(() => ({
  folders: undefined as unknown,
  update: vi.fn(),
  pending: false,
  closed: [] as boolean[],
  formSheet: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaFolders: () => ({ data: state.folders }),
  useUpdateMediaAsset: () => ({ mutateAsync: state.update, isPending: state.pending }),
}));
vi.mock('../../lib/media', () => ({
  mediaUrl: (path: string | null | undefined, variant: string) => `${variant}:${String(path)}`,
}));
vi.mock('../../lib/api-error', () => ({
  getApiErrorMessage: (err: unknown, fallback: string) =>
    err instanceof Error ? `msg:${err.message}` : fallback,
}));
vi.mock('../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));

const asset = (over: Record<string, unknown> = {}) => ({
  id: 'a1',
  filename: 'slika.jpg',
  tags: 'stadion, tribina',
  folderId: 'f1',
  thumbPath: 'thumbs/slika.jpg',
  mediumPath: null as string | null,
  originalPath: 'orig/slika.jpg',
  ...over,
});

const Sheet = MediaAssetFormSheet as unknown as (p: Record<string, unknown>) => React.ReactElement;
const props = (over: Record<string, unknown> = {}) => ({
  asset: asset(),
  open: true,
  onOpenChange: (open: boolean) => state.closed.push(open),
  ...over,
});
const renderSheet = (over: Record<string, unknown> = {}) => render(<Sheet {...props(over)} />);

beforeEach(() => {
  state.folders = [{ id: 'f1', name: 'Stadion' }, { id: 'f2', name: 'Prvi tim' }];
  state.update.mockReset();
  state.update.mockResolvedValue({});
  state.pending = false;
  state.closed = [];
  state.formSheet = {};
});

describe('MediaAssetFormSheet — prikaz', () => {
  it('bez zapisa ne prikazuje ništa', () => {
    const { container } = renderSheet({ asset: null });
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje tri veličine slike, sa fallbackom na original', () => {
    renderSheet();
    const images = document.querySelectorAll('img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', 'thumb:thumbs/slika.jpg');
    expect(images[1]).toHaveAttribute('src', 'medium:orig/slika.jpg');
    expect(images[2]).toHaveAttribute('src', 'original:orig/slika.jpg');
    expect(screen.getByText('thumb')).toBeInTheDocument();
    expect(screen.getByText('original')).toBeInTheDocument();
  });

  it('prefill-a naziv, tagove i folder te listu foldera', () => {
    renderSheet();
    expect(screen.getByDisplayValue('slika.jpg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('stadion, tribina')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('f1');
    expect(screen.getByRole('option', { name: 'Stadion' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Prvi tim' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'admin.mediaAsset.noFolder' })).toBeInTheDocument();
  });

  it('zapis bez taga i foldera koristi prazna polja i "bez foldera"', () => {
    renderSheet({ asset: asset({ tags: undefined, folderId: undefined }) });
    expect(screen.getByPlaceholderText('admin.mediaAsset.tagsPlaceholder')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('folders kao objekat sa data i null se normalizuju', () => {
    state.folders = { data: [{ id: 'f9', name: 'Arhiva' }] };
    const { unmount } = renderSheet();
    expect(screen.getByRole('option', { name: 'Arhiva' })).toBeInTheDocument();
    unmount();
    state.folders = null;
    renderSheet();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });
});

describe('MediaAssetFormSheet — spremanje', () => {
  it('spremanje šalje izmijenjena polja i zatvara dijalog', async () => {
    const user = userEvent.setup();
    renderSheet();
    const tags = screen.getByDisplayValue('stadion, tribina');
    await user.clear(tags);
    await user.type(tags, 'novo');
    await user.selectOptions(screen.getByRole('combobox'), 'f2');
    await user.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    expect(state.update).toHaveBeenCalledWith({
      id: 'a1',
      filename: 'slika.jpg',
      tags: 'novo',
      folderId: 'f2',
    });
    await waitFor(() => expect(state.closed).toEqual([false]));
  });

  it('prazan folder se šalje kao null', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.selectOptions(screen.getByRole('combobox'), '');
    await user.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    expect(state.update.mock.calls[0][0]).toMatchObject({ folderId: null });
  });

  it('greška spremanja prikazuje poruku i ne zatvara dijalog', async () => {
    const user = userEvent.setup();
    state.update.mockRejectedValue(new Error('zauzeto'));
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('msg:zauzeto'));
    expect(state.closed).toEqual([]);
  });

  it('neobjektna greška koristi prijevod kao fallback', async () => {
    const user = userEvent.setup();
    state.update.mockRejectedValue('nepoznato');
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('admin.mediaAsset.saveError'),
    );
  });

  it('nova greška briše prethodnu, a spremanje u toku gasi dugme', async () => {
    const user = userEvent.setup();
    state.update.mockRejectedValueOnce(new Error('prva'));
    const { rerender } = renderSheet();
    await user.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('msg:prva'));
    state.update.mockResolvedValueOnce({});
    await user.click(screen.getByRole('button', { name: 'Sačuvaj' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    state.pending = true;
    rerender(<Sheet {...props()} />);
    expect(screen.getByRole('button', { name: 'Sačuvaj' })).toBeDisabled();
  });
});
