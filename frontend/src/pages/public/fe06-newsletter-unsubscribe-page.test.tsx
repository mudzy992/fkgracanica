import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsletterUnsubscribePage } from './NewsletterUnsubscribePage';

const state = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../lib/api', () => ({
  api: { get: (...args: unknown[]) => state.apiGet(...(args as [])) },
}));

const renderPage = (ui: React.ReactElement, query = '') =>
  render(<MemoryRouter initialEntries={[`/x${query}`]}>{ui}</MemoryRouter>);

describe('NewsletterUnsubscribePage', () => {
  beforeEach(() => {
    state.apiGet = vi.fn();
  });

  it('bez tokena odmah prikazuje nevažeći link i ne zove API', () => {
    renderPage(<NewsletterUnsubscribePage />);
    expect(screen.getByText('pages.newsletter.invalid')).toBeTruthy();
    expect(state.apiGet).not.toHaveBeenCalled();
  });

  it('sa tokenom prvo prikazuje učitavanje pa uspjeh', async () => {
    state.apiGet = vi.fn(async () => ({ data: {} }));
    renderPage(<NewsletterUnsubscribePage />, '?token=abc');
    expect(screen.getByText('pages.newsletter.loading')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('pages.newsletter.success')).toBeTruthy());
    expect(state.apiGet).toHaveBeenCalledWith('/newsletter/unsubscribe', { params: { token: 'abc' } });
  });

  it('greška API-ja prikazuje nevažeći link', async () => {
    state.apiGet = vi.fn(async () => {
      throw new Error('nope');
    });
    renderPage(<NewsletterUnsubscribePage />, '?token=abc');
    await waitFor(() => expect(screen.getByText('pages.newsletter.invalid')).toBeTruthy());
  });
});
