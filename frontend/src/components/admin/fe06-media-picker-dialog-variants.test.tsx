import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MediaPickerDialog } from './MediaPickerDialog';

const state = vi.hoisted(() => ({
  assets: { data: null as unknown, isLoading: false },
  folders: { data: [] as unknown[] },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-media-admin', () => ({
  useMediaFolders: () => state.folders,
  useMediaAssets: () => state.assets,
}));
vi.mock('../../lib/media', () => ({ mediaUrl: (p: string) => `media:${p}` }));
vi.mock('../ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) => open ? <div role="dialog">{children}</div> : null,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
}));
vi.mock('../ui/input', () => ({ Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} /> }));
vi.mock('./MediaFolderPicker', () => ({ MediaFolderPicker: () => null }));
vi.mock('../ui/button', () => ({ Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} /> }));

describe('MediaPickerDialog — varijante (2 grane: data?.data ?? data + thumbPath fallback)', () => {
  beforeEach(() => {
    state.folders = { data: [] } as unknown as typeof state.folders;
  });

  it('pokriva data?.data ?? data kad je data direktno niz', () => {
    const asset = { id: 'a1', filename: 'f1.jpg', originalPath: 'media/f1.jpg', thumbPath: 'media/thumb1.jpg' };
    state.assets = { data: [asset] as unknown, isLoading: false };
    render(<MediaPickerDialog open onOpenChange={() => {}} onConfirm={() => {}} />);
    const img = screen.getByAltText('f1.jpg') as HTMLImageElement;
    expect(img.src).toContain('media:media/thumb1.jpg');
  });

  it('pokriva thumbPath ?? originalPath kad je thumbPath null', () => {
    const asset = { id: 'a2', filename: 'f2.jpg', originalPath: 'media/f2.jpg', thumbPath: null as unknown as string };
    state.assets = { data: { data: [asset] } as unknown, isLoading: false };
    render(<MediaPickerDialog open onOpenChange={() => {}} onConfirm={() => {}} />);
    const img = screen.getByAltText('f2.jpg') as HTMLImageElement;
    expect(img.src).toContain('media:media/f2.jpg');
  });

  it('pokriva oba fallbacka zajedno: data niz + thumbPath undefined', () => {
    const asset = { id: 'a3', filename: 'f3.jpg', originalPath: 'media/f3.jpg', thumbPath: undefined as unknown as string };
    state.assets = { data: [asset] as unknown, isLoading: false };
    render(<MediaPickerDialog open onOpenChange={() => {}} onConfirm={() => {}} />);
    expect(screen.getByAltText('f3.jpg')).toBeInTheDocument();
  });
});
