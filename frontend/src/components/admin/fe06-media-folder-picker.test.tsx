import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { MediaFolder } from '../../hooks/use-media-admin';
import { MediaFolderPicker } from './MediaFolderPicker';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const folder = (over: Partial<MediaFolder> & { id: string; name: string }): MediaFolder =>
  ({ parentId: null, _count: { assets: 0 }, ...over }) as MediaFolder;

const folders = [
  folder({ id: 'f1', name: 'Utakmice', _count: { assets: 12 } }),
  folder({ id: 'f2', name: 'Derbi', parentId: 'f1', _count: { assets: 3 } }),
  folder({ id: 'f3', name: 'Trening', parentId: 'f2' }),
  folder({ id: 'f4', name: 'Arhiva' }),
];

describe('MediaFolderPicker', () => {
  it('uvijek prikazuje stavku „Sve slike“ i korijenske foldere', () => {
    render(<MediaFolderPicker folders={folders} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Sve slike/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Utakmice/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Arhiva/ })).toBeTruthy();
  });

  it('prikazuje broj slika po folderu', () => {
    render(<MediaFolderPicker folders={folders} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Utakmice/ }).textContent).toBe('Utakmice12');
    expect(screen.getByRole('button', { name: /Arhiva/ }).textContent).toBe('Arhiva0');
  });

  it('podfolderi su ugniježđeni i vidljivi po defaultu', () => {
    render(<MediaFolderPicker folders={folders} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Derbi/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Trening/ })).toBeTruthy();
  });

  it('preklapanje skriva podfoldere, ponovni klik ih vraća', async () => {
    render(<MediaFolderPicker folders={folders} onSelect={vi.fn()} />);
    // prvi preklopnik pripada korijenskom folderu „Utakmice“
    const toggle = screen.getAllByRole('button', { name: 'admin.mediaPicker.toggleFolders' })[0];
    await userEvent.click(toggle);
    expect(screen.queryByRole('button', { name: /Derbi/ })).toBeNull();
    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: /Derbi/ })).toBeTruthy();
  });

  it('klik na folder emituje njegov ID', async () => {
    const onSelect = vi.fn();
    render(<MediaFolderPicker folders={folders} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Arhiva/ }));
    expect(onSelect).toHaveBeenCalledWith('f4');
  });

  it('klik na podfolder emituje ID podfoldera', async () => {
    const onSelect = vi.fn();
    render(<MediaFolderPicker folders={folders} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Derbi/ }));
    expect(onSelect).toHaveBeenCalledWith('f2');
  });

  it('„Sve slike“ emituje undefined', async () => {
    const onSelect = vi.fn();
    render(<MediaFolderPicker folders={folders} selectedId="f4" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Sve slike/ }));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });

  it('prazna lista prikazuje samo „Sve slike“', () => {
    render(<MediaFolderPicker folders={[]} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
