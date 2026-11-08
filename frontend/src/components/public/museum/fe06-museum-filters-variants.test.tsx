import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MuseumFilters } from './MuseumFilters';

describe('MuseumFilters — varijante (2 grane)', () => {
  it('selektovana godina koristi default variant i shadow', async () => {
    const onYear = vi.fn();
    const user = userEvent.setup();
    render(<MuseumFilters years={[2020, 2021]} categories={[]} year={2020} categoryLabel={(c) => c} onYear={onYear} onCategory={vi.fn()} />);
    const btn = screen.getByRole('button', { name: '2020' });
    expect(btn.className).toContain('shadow-sm');
    await user.click(btn);
    expect(onYear).toHaveBeenCalledWith(2020);
  });

  it('neselektovana godina koristi outline', () => {
    render(<MuseumFilters years={[2020]} categories={['foto']} year={2021} category="foto" categoryLabel={(c) => c.toUpperCase()} onYear={vi.fn()} onCategory={vi.fn()} />);
    expect(screen.getByRole('button', { name: '2020' })).toBeInTheDocument();
  });
});
