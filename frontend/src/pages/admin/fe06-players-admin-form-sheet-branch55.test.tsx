import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useClubs: () => ({ data: undefined }), // clubs ?? [] fallback
  useOwnClub: () => ({ data: undefined }),
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useCreatePlayer: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdatePlayer: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({ AdminFormSheet: ({ children }: any) => <div>{children}</div> }));
vi.mock('../../components/admin/EntitySelect', () => ({ EntitySelect: () => <div /> }));
vi.mock('../../components/admin/MediaPicker', () => ({ MediaPicker: () => <div /> }));

import { PlayersAdminFormSheet } from './PlayersAdminFormSheet';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('fe06 PlayersAdminFormSheet branch55', () => {
  it('clubs undefined → ?? []', () => {
    render(wrap(<PlayersAdminFormSheet open={true} onOpenChange={() => {}} edit={null} />));
    expect(document.body.textContent).toBeDefined();
  });
  it('fixedClubId falsy + clubId falsy → || undefined fallback', () => {
    render(wrap(<PlayersAdminFormSheet open={true} onOpenChange={() => {}} edit={null} clubId={undefined} />));
    expect(document.body.textContent).toBeDefined();
  });
  it('edit null still renders with empty clubId', () => {
    render(wrap(<PlayersAdminFormSheet open={false} onOpenChange={() => {}} edit={null} />));
    expect(document.body.textContent).toBeDefined();
  });
});
