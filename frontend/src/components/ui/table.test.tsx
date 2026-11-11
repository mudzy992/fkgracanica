import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

describe('Table (FE-01)', () => {
  it('renderuje header i redove sa standardnim klasama', () => {
    render(
      <Table aria-label="tabela">
        <TableHeader>
          <TableRow>
            <TableHead>Sezona</TableHead>
            <TableHead>Nastupi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>2024</TableCell>
            <TableCell>12</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2023</TableCell>
            <TableCell>8</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('Sezona')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    const table = screen.getByLabelText('tabela');
    expect(table).toHaveClass('w-full', 'text-sm');
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('spaja custom className na Table, Head i Cell', () => {
    render(
      <Table className="mt-2" aria-label="t2">
        <TableHeader>
          <TableRow className="bg-surface">
            <TableHead className="text-right">A</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="tabular-nums">1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByLabelText('t2')).toHaveClass('mt-2');
    expect(screen.getByText('A')).toHaveClass('text-right');
    expect(screen.getByText('1')).toHaveClass('tabular-nums');
  });

  it('podržava caption i footer', () => {
    render(
      <Table aria-label="t3">
        <TableBody>
          <TableRow>
            <TableCell>X</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
