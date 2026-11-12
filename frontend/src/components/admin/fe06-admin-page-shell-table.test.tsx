import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminPageShell, AdminDataTable } from './AdminPageShell';

const columns = [
  { key: 'name', header: 'Naziv', render: (row: { id: string; name: string }) => row.name },
];

describe('AdminPageShell', () => {
  it('učitavanje prikazuje skeletone umjesto sadržaja', () => {
    const { container } = render(
      <AdminPageShell title="Klubovi" isLoading>
        <p>sadržaj</p>
      </AdminPageShell>,
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBe(5);
    expect(screen.queryByText('sadržaj')).toBeNull();
  });

  it('greška prikazuje poruku i ponovni pokušaj bez sadržaja', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <AdminPageShell title="Klubovi" isError onRetry={onRetry}>
        <p>sadržaj</p>
      </AdminPageShell>,
    );
    expect(screen.queryByText('sadržaj')).toBeNull();
    await user.click(screen.getByRole('button', { name: /pokušaj|Pokušaj/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('prikazuje naslov, akciju i sadržaj kad nema greške', () => {
    render(
      <AdminPageShell title="Klubovi" actions={<button>Novi</button>}>
        <p>sadržaj</p>
      </AdminPageShell>,
    );
    expect(screen.getByRole('heading', { name: 'Klubovi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Novi' })).toBeInTheDocument();
    expect(screen.getByText('sadržaj')).toBeInTheDocument();
  });
});

describe('AdminDataTable', () => {
  it('red bez onRowClick se ne ponaša kao dugme', () => {
    render(<AdminDataTable rows={[{ id: 'r1', name: 'Prvi' }]} columns={columns} />);
    expect(screen.getByText('Prvi')).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Prvi/ })).not.toHaveClass('cursor-pointer');
  });

  it('red sa onRowClick zove obrađivač i dobija kursor', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <AdminDataTable
        rows={[{ id: 'r1', name: 'Prvi' }]}
        columns={columns}
        onRowClick={onRowClick}
        rowClassName={(row) => (row.id === 'r1' ? 'oznacen' : undefined)}
      />,
    );
    const row = screen.getByRole('row', { name: /Prvi/ });
    expect(row).toHaveClass('cursor-pointer', 'oznacen');
    await user.click(row);
    expect(onRowClick).toHaveBeenCalledWith({ id: 'r1', name: 'Prvi' });
  });

  it('prazna tabela prikazuje proslijeđenu poruku', () => {
    render(<AdminDataTable rows={[]} columns={columns} empty="Nema klubova" />);
    expect(screen.getByText('Nema klubova')).toBeInTheDocument();
  });
});
