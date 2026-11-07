import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPickerDialog } from './MediaPickerDialog';
import { installDialogPolyfill } from '../../test/dialog-polyfill';

/**
 * Q-FE06-36: `selectedPaths` je nekad imao default `[]` — nova referenca svakog
 * rendera → efekt → `setPicked` → render → beskonačna petlja. Sada je modulska
 * konstanta, pa izostavljanje propa više ne visi.
 */
const state = vi.hoisted(() => ({
  assets: { data: { data: [] as unknown[] }, isLoading: false },
  folders: { data: [] as unknown[] },
  confirmed: [] as string[][],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaAssets: () => state.assets,
  useMediaFolders: () => state.folders,
  useDeleteMedia: () => ({ mutateAsync: vi.fn() }),
  useUpdateMediaAsset: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../lib/media', () => ({
  mediaUrl: (path: string | undefined) => (path ? `img:${path}` : undefined),
}));

const asset = (i: number) => ({
  id: `a${i}`,
  filename: `slika-${i}.jpg`,
  originalPath: `media/slika-${i}.jpg`,
  thumbPath: `media/slika-${i}.jpg`,
  mimeType: 'image/jpeg',
  size: 1000,
});

beforeAll(() => installDialogPolyfill());

beforeEach(() => {
  state.assets = { data: { data: [asset(1), asset(2)] }, isLoading: false };
  state.folders = { data: [{ id: 'f1', name: 'Utakmice', parentId: null, _count: { assets: 2 } }] };
  state.confirmed = [];
});
describe('MediaPickerDialog — bez selectedPaths (Q-FE06-36)', () => {
  beforeAll(() => installDialogPolyfill());

  beforeEach(() => {
    state.assets = { data: { data: [asset(1), asset(2)] }, isLoading: false };
    state.folders = { data: [{ id: 'f1', name: 'Utakmice', parentId: null, _count: { assets: 2 } }] };
    state.confirmed = [];
  });

  it('izostavljen prop ne pokreće beskonačnu petlju', async () => {
    render(
      <MediaPickerDialog open onOpenChange={() => undefined} onConfirm={() => undefined} />,
    );
    expect(await screen.findByAltText('slika-1.jpg')).toBeTruthy();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('izostavljen prop znači prazna početna selekcija', async () => {
    render(
      <MediaPickerDialog
        open
        onOpenChange={() => undefined}
        onConfirm={(paths) => state.confirmed.push(paths)}
      />,
    );
    await screen.findByAltText('slika-1.jpg');
    await userEvent.click(screen.getByAltText('slika-2.jpg').closest('button')!);
    expect(state.confirmed).toEqual([['media/slika-2.jpg']]);
  });
});

