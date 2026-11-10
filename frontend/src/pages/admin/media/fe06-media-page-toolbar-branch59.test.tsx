import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaPageToolbar } from './MediaPageToolbar';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/ui/button', () => ({ Button: (p: any) => <button {...p}>{p.children}</button> }));
vi.mock('../../../components/ui/input', () => ({ Input: (p: any) => <input {...p} /> }));
vi.mock('./MediaUploadProgress', () => ({ MediaUploadProgress: () => <div /> }));

const base = (over: Record<string, unknown> = {}) => ({
  search: '',
  onSearchChange: vi.fn(),
  globalSearch: false,
  debouncedSearch: '',
  totalResults: undefined,
  folderId: undefined,
  selectedFolderName: undefined,
  selectionMode: false,
  selectedCount: 0,
  visibleCount: 0,
  onToggleSelectionMode: vi.fn(),
  onSelectAllVisible: vi.fn(),
  onUploadClick: vi.fn(),
  uploadDisabled: false,
  ...over,
});

describe('MediaPageToolbar branch59 coverable ??', () => {
  it('globalSearch totalResults undefined → 0 fallback', () => {
    render(<MediaPageToolbar {...(base({ globalSearch: true, debouncedSearch: 'test', totalResults: undefined }) as any)} />);
    expect(screen.getByText(/0 pronađenih/)).toBeInTheDocument();
  });
  it('globalSearch totalResults null → 0 fallback', () => {
    render(<MediaPageToolbar {...(base({ globalSearch: true, debouncedSearch: 'a', totalResults: null }) as any)} />);
    expect(screen.getByText(/0 pronađenih/)).toBeInTheDocument();
  });
  it('folderId with selectedFolderName undefined → — fallback', () => {
    render(
      <MediaPageToolbar
        {...(base({ folderId: 'f1', selectedFolderName: undefined, onFolderChipClick: vi.fn() }) as any)}
      />,
    );
    expect(screen.getByText(/Mapa: —/)).toBeInTheDocument();
  });
  it('folderId with selectedFolderName null → — fallback', () => {
    render(
      <MediaPageToolbar
        {...(base({ folderId: 'f1', selectedFolderName: null, onFolderChipClick: vi.fn() }) as any)}
      />,
    );
    expect(screen.getByText(/Mapa: —/)).toBeInTheDocument();
  });
});
