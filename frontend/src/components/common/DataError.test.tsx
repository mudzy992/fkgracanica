import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../../i18n';
import { DataError } from './DataError';

describe('DataError (FE-03)', () => {
  it('prikazuje poruku i ima role="alert"', () => {
    render(<DataError message="Greška u učitavanju" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Greška u učitavanju');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('koristi default poruku iz locale fajla', () => {
    render(<DataError />);
    expect(screen.getByRole('alert')).toHaveTextContent(/Podatke nije moguće učitati/);
  });

  it('poziva retry kad je proslijeđen', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<DataError onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Pokušaj ponovo' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
