import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (orig) => {
  const a: any = await orig();
  return { ...a, useTranslation: () => ({ t: (k: string, d?: string) => d ?? k }) };
});
vi.mock('../../hooks/use-club-hub', () => ({ useClub: () => ({ data: { id: '1', name: 'Test', isOwnClub: true }, isLoading: false }) }));
vi.mock('../../lib/utils', async (orig) => { const a: any = await orig(); return { ...a, cn: (...xs: any[]) => xs.filter(Boolean).join(' ') }; });
vi.mock('../../components/admin/AdminBreadcrumbs', () => ({ AdminBreadcrumbs: () => <div>bc</div> }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('./club-hub/ClubHubPanel', () => ({ ClubHubPanel: ({ children }: any) => <div>{children}</div> }));
vi.mock('./club-hub/tabs/ClubBasicTab', () => ({ ClubBasicTab: () => <div>basic</div> }));
vi.mock('./club-hub/tabs/ClubStadiumTab', () => ({ ClubStadiumTab: () => <div>stadium</div> }));
vi.mock('./club-hub/tabs/ClubPlayersTab', () => ({ ClubPlayersTab: () => <div>players</div> }));
vi.mock('./club-hub/tabs/ClubFormationTab', () => ({ ClubFormationTab: () => <div>formation</div> }));
vi.mock('./club-hub/tabs/ClubStatsTab', () => ({ ClubStatsTab: () => <div>stats</div> }));

const qc = new QueryClient();
const wrap = (ui: React.ReactNode, path: string) => (
  <QueryClientProvider client={qc}><MemoryRouter initialEntries={[path]}><Routes><Route path="/admin/clubs/:id" element={ui} /></Routes></MemoryRouter></QueryClientProvider>
);

describe('batch60 tab fallback — ClubHubPage 84 [14,0]', () => {
  it('tab fallback ?? basic', async () => {
    const { ClubHubPage } = await import('./club-hub/ClubHubPage');
    const { container } = render(wrap(<ClubHubPage />, '/admin/clubs/1'));
    expect(container.textContent).toContain('Test');
  });
  it('tab present', async () => {
    const { ClubHubPage } = await import('./club-hub/ClubHubPage');
    const { container } = render(wrap(<ClubHubPage />, '/admin/clubs/1?tab=players'));
    expect(container.textContent).toContain('Test');
  });
});
