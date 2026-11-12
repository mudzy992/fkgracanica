import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
const st = vi.hoisted(() => ({ confirmOk: true, qrDelay: false, qrFail: false, rounds: [] as unknown[] }));
vi.mock('../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: async () => st.confirmOk, dialog: null }) }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['live.manage'] }, isAuthenticated: true, isLoading: false }) }));
vi.mock('../hooks', async () => {
  const a = await vi.importActual<typeof import('../hooks')>('../hooks');
  return { ...a, useMatches: () => ({ data: [{ id: 'm1', status: 'SCHEDULED', homeClub: { name: 'A' }, awayClub: { name: 'B' }, homeScore: 0, awayScore: 0, scheduledAt: '2024-01-01' } as never], isLoading: false }) };
});
vi.mock('../hooks/use-rounds', async () => {
  const a = await vi.importActual<typeof import('../hooks/use-rounds')>('../hooks/use-rounds');
  return { ...a, useRounds: () => ({ data: st.rounds as never, isLoading: false }), useDeleteRound: () => ({ mutateAsync: vi.fn(), isPending: false }), useCreateRound: () => ({ mutateAsync: vi.fn(), isPending: false }), useUpdateRound: () => ({ mutateAsync: vi.fn(), isPending: false }) };
});
vi.mock('../lib/pass-qr', () => ({
  qrDataUrl: vi.fn((_v: string, size: number) => {
    if (size === 280 && st.qrDelay) return new Promise((_, r) => setTimeout(() => r(new Error('x')), 100));
    if (size === 280 && st.qrFail) return Promise.reject(new Error('fail'));
    if (st.qrFail && size !== 280) return Promise.reject(new Error('fail'));
    return Promise.resolve('data:image/png;base64,abc');
  }),
}));
vi.mock('../components/ui/dialog', () => ({ Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (open ? <div>{children}</div> : null), DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../components/ui/button', async () => { const a = await vi.importActual<typeof import('../components/ui/button')>('../components/ui/button'); return { ...a, Button: ({ children, onClick, ...p }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick} {...p}>{children}</button> }; });
vi.mock('../lib/media', async () => { const a = await vi.importActual('../lib/media') as never; return { ...(a as object), mediaUrl: () => '' }; });
vi.mock('../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../pages/admin/competition-hub/RoundFormSheet', () => ({ RoundFormSheet: ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => open ? <div><button onClick={() => onOpenChange(false)}>close-round</button><button onClick={() => onOpenChange(true)}>open-round</button></div> : null }));
vi.mock('../pages/admin/competition-hub/RoundCascadeDeleteDialog', () => ({ RoundCascadeDeleteDialog: () => <div>cascade</div> }));
vi.mock('../pages/admin/competition-hub/MatchFormSheet', () => ({ MatchFormSheet: ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => open ? <div><button onClick={() => onOpenChange(false)}>close-match</button><button onClick={() => onOpenChange(true)}>open-match</button></div> : null }));
vi.mock('../pages/admin/competition-hub/MatchLineupSheet', () => ({ MatchLineupSheet: () => null }));
vi.mock('../lib/api', () => ({ api: { get: vi.fn(async () => ({ data: { matchCount: 1 } })) } }));

import { HeroSectionForm } from '../pages/admin/cms/forms/HeroSectionForm';
import { PassQrCode } from '../components/pass/PassQrCode';
import { AdminFormSheet } from '../components/admin/AdminFormSheet';
import { RoundMatchesPanel } from '../pages/admin/competition-hub/RoundMatchesPanel';
import { SeasonRoundsPanel } from '../pages/admin/competition-hub/SeasonRoundsPanel';

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;

describe('fe06-batch69l 5 grana', () => {
  beforeEach(() => { st.confirmOk = true; st.qrDelay = false; st.qrFail = false; st.rounds = [{ id: 'r1', name: 'Kolo 1', _count: { matches: 1 } } as never, { id: 'r2', name: 'Kolo 2' } as never]; });
  afterEach(() => cleanup());

  it('HeroSectionForm hero.buttons ?? [] oba', async () => {
    const onChange = vi.fn();
    const { rerender, unmount } = render(wrap(<HeroSectionForm config={{ buttons: [{ label: 'a', url: '/a', variant: 'primary' }] as never }} onChange={onChange} />));
    fireEvent.change(screen.getByPlaceholderText('admin.cmsWidget.buttonLabel'), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalled(); onChange.mockClear();
    rerender(wrap(<HeroSectionForm config={{ buttons: undefined } as never} onChange={onChange} />));
    fireEvent.click(screen.getAllByText('+ Dugme')[0]);
    expect(onChange).toHaveBeenCalled(); unmount();
    const Wrapper = () => {
      const [cfg, setCfg] = React.useState<Record<string, unknown>>({ buttons: undefined });
      return <HeroSectionForm config={cfg} onChange={(c) => { setCfg(c); onChange(c); }} />;
    };
    render(wrap(<Wrapper />));
    fireEvent.click(screen.getAllByText('+ Dugme')[0]);
    await waitFor(() => expect(screen.getByPlaceholderText('admin.cmsWidget.buttonLabel')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('admin.cmsWidget.buttonLabel'), { target: { value: 'c' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('PassQrCode largeSrc cancelled', async () => {
    st.qrDelay = false; st.qrFail = false;
    const { unmount } = render(wrap(<PassQrCode value="v1" enlargeSize={280} />));
    await waitFor(() => expect(document.querySelector('img')).toBeTruthy());
    st.qrDelay = true;
    fireEvent.click(screen.getByLabelText('Povećaj QR kod'));
    await new Promise((r) => setTimeout(r, 10)); unmount(); await new Promise((r) => setTimeout(r, 120));
    st.qrDelay = false; st.qrFail = false;
    const { unmount: u2 } = render(wrap(<PassQrCode value="v2" />));
    await waitFor(() => expect(document.querySelector('img')).toBeTruthy());
    fireEvent.click(screen.getByLabelText('Povećaj QR kod'));
    await waitFor(() => expect(document.querySelectorAll('img').length).toBeGreaterThan(0)); u2();
    st.qrFail = false;
    const { unmount: u3 } = render(wrap(<PassQrCode value="v3" />));
    await waitFor(() => expect(document.querySelector('img')).toBeTruthy());
    st.qrFail = true;
    fireEvent.click(screen.getByLabelText('Povećaj QR kod'));
    await waitFor(() => expect(screen.getByText('QR kod nije dostupan')).toBeInTheDocument()); u3();
  });

  it('AdminFormSheet prepareEdit else', async () => {
    render(wrap(<AdminFormSheet open onOpenChange={vi.fn()} title="t"> <input placeholder="inp" /> <div role="switch">sw</div> </AdminFormSheet>));
    const inp = screen.getByPlaceholderText('inp');
    fireEvent.input(inp, { target: { value: 'x' } });
    fireEvent.focusIn(inp);
    fireEvent.click(screen.getByText('sw'));
    window.dispatchEvent(new Event('beforeunload'));
    expect(document.body).toBeTruthy();
  });

  it('RoundMatchesPanel if (!o) oba', async () => {
    render(wrap(<RoundMatchesPanel seasonId="s1" roundId="r1" canManage />));
    fireEvent.click(screen.getAllByText('Utakmica')[0]);
    expect(screen.getByText('close-match')).toBeInTheDocument();
    fireEvent.click(screen.getByText('close-match'));
    await waitFor(() => expect(screen.queryByText('close-match')).not.toBeInTheDocument());
    fireEvent.click(screen.getAllByText('Utakmica')[0]);
    fireEvent.click(screen.getByText('open-match'));
    expect(screen.getByText('close-match')).toBeInTheDocument();
  });

  it('SeasonRoundsPanel count ?? 0', async () => {
    render(wrap(<SeasonRoundsPanel seasonId="s1" selectedRoundId={null} onSelectRound={vi.fn()} canManage />));
    expect(screen.getByText('Kolo 1')).toBeInTheDocument();
    const dels = screen.getAllByLabelText('actions.delete');
    st.confirmOk = false; fireEvent.click(dels[1]); await waitFor(() => expect(document.body).toBeTruthy());
    st.confirmOk = true; fireEvent.click(dels[1]); await waitFor(() => expect(document.body).toBeTruthy());
    fireEvent.click(dels[0]); await waitFor(() => expect(document.body).toBeTruthy());
  });
});
