import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './../../i18n';
import { ActionErrorAlert, ACTION_ERROR_TIMEOUT_MS } from './ActionErrorAlert';
import {
  clearActionError,
  reportActionError,
  resetActionErrorForTests,
} from '../../lib/action-errors';



beforeEach(() => {
  resetActionErrorForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ActionErrorAlert — poruka kao ključ', () => {
  it('opštu poruku prevodi pri renderovanju', () => {
    render(<ActionErrorAlert />);
    act(() => {
      reportActionError({});
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Akcija nije uspjela. Pokušajte ponovo.');
  });
});

describe('ActionErrorAlert — prikaz', () => {
  it('bez greške ne renderuje ništa', () => {
    const { container } = render(<ActionErrorAlert />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje poruku kao `role="alert"`', () => {
    render(<ActionErrorAlert />);
    act(() => {
      reportActionError(new Error('Nema dozvole'));
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Nema dozvole');
  });

  it('zatvaranje uklanja traku', async () => {
    const user = userEvent.setup();
    render(<ActionErrorAlert />);
    act(() => {
      reportActionError(new Error('Greška'));
    });
    await user.click(screen.getByRole('button', { name: 'Zatvori' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('traka se sama skloni poslije isteka vremena', () => {
    vi.useFakeTimers();
    render(<ActionErrorAlert />);
    act(() => {
      reportActionError(new Error('Privremena greška'));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(ACTION_ERROR_TIMEOUT_MS);
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('nova greška zamjenjuje prethodnu poruku', () => {
    render(<ActionErrorAlert />);
    act(() => {
      reportActionError(new Error('prva'));
    });
    act(() => {
      reportActionError(new Error('druga'));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('druga');
  });

  it('ručno čišćenje takođe uklanja traku', () => {
    render(<ActionErrorAlert />);
    act(() => {
      reportActionError(new Error('x'));
    });
    act(() => {
      clearActionError();
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
