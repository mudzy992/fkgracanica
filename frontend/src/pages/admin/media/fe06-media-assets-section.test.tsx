import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaPageAssetsSection } from './MediaPageAssetsSection';

vi.mock('./MediaAssetsGrid', () => ({
  MediaAssetsGrid: ({ empty }: { empty: string }) => <div>grid:{empty}</div>,
}));
vi.mock('../MediaAssetsTable', () => ({
  MediaAssetsTable: () => <div>tabela</div>,
}));
vi.mock('./MediaBulkActionBar', () => ({
  MediaBulkActionBar: (props: Record<string, unknown>) => (
    <div>bulk:{(props.selectedIds as Set<string>).size}</div>
  ),
}));
vi.mock('../../../components/admin/AdminPagination', () => ({
  AdminPagination: ({ page }: { page: number }) => <div>strana:{page}</div>,
}));

const baseProps = {
  assets: [],
  empty: 'Nema medija u ovoj mapi.',
  copied: null,
  folders: [],
  selectionMode: false,
  selectedIds: new Set<string>(),
  isSelected: () => false,
  onToggleSelect: vi.fn(),
  onCopy: vi.fn(),
  onClearSelection: vi.fn(),
  onExitSelection: vi.fn(),
  selectedCount: 0,
  page: 1,
  onPageChange: vi.fn(),
  meta: { page: 1, totalPages: 2, total: 30 },
} as unknown as Parameters<typeof MediaPageAssetsSection>[0];

describe('MediaPageAssetsSection', () => {
  it('bez selekcije prikazuje grid i paginaciju bez bulk trake', () => {
    const { container } = render(<MediaPageAssetsSection {...baseProps} selectedCount={0} />);
    expect(screen.getByText('grid:Nema medija u ovoj mapi.')).toBeInTheDocument();
    expect(screen.queryByText(/bulk:/)).toBeNull();
    expect(container.firstElementChild?.className).toContain('pb-4');
  });

  it('sa selekcijom prikazuje bulk traku i dodatni razmak', () => {
    const { container } = render(
      <MediaPageAssetsSection {...baseProps} selectedCount={2}
        selectedIds={new Set(['a1', 'a2'])} onConfirmBulkDelete={vi.fn()} />,
    );
    expect(screen.getByText('bulk:2')).toBeInTheDocument();
    expect(container.firstElementChild?.className).toContain('pb-20');
  });
});
