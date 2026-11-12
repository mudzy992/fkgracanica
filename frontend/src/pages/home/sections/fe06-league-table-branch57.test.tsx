import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../hooks', async () => {
  const actual = await vi.importActual<typeof import('../../../hooks')>('../../../hooks');
  return { ...actual, useSeasons: vi.fn(), useStandings: vi.fn() };
});
vi.mock('../../../lib/season-utils', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/season-utils')>('../../../lib/season-utils');
  return { ...actual, pickDefaultCalendarId: vi.fn(() => 'cal1'), leagueEdition: vi.fn((c: any) => c ? { id: 'season1' } : undefined) };
});
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

import { useSeasons, useStandings } from '../../../hooks';
import { LeagueTable } from './LeagueTable';

describe('fe06 LeagueTable branch57', () => {
  it('isLoading true → skeleton', () => {
    (useSeasons as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: true });
    (useStandings as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: false });
    const { container } = render(<LeagueTable />);
    expect(container.innerHTML).toContain('animate-pulse');
  });
  it('standings undefined → ?? [] fallback (noResults)', () => {
    (useSeasons as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [{ id: 'cal1', name: '2024', competitions: [] }], isLoading: false });
    (useStandings as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: false });
    render(<LeagueTable />);
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });
  it('standings [] → noResults takođe', () => {
    (useSeasons as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [{ id: 'cal1', name: '2024', competitions: [] }], isLoading: false });
    (useStandings as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false });
    render(<LeagueTable />);
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });
});
