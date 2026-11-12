import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsletterCampaignPanel } from './NewsletterCampaignPanel';

const state = vi.hoisted(() => ({
  permissions: undefined as string[] | undefined,
  settings: {} as Record<string, string>,
  campaigns: undefined as unknown,
  isLoading: false,
  confirm: vi.fn(),
  send: vi.fn(),
  isPending: false,
}));

vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../hooks', () => ({ usePrivateSettings: () => ({ data: state.settings }) }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: <div data-testid="confirm-dialog" /> }),
}));
vi.mock('../../hooks/use-newsletter-campaigns', () => ({
  useNewsletterCampaigns: () => ({ data: state.campaigns, isLoading: state.isLoading }),
  useNewsletterCampaignRealtime: () => undefined,
  useSendNewsletterCampaign: () => ({ mutateAsync: state.send, isPending: state.isPending }),
}));
vi.mock('./NewsletterCampaignComposer', () => ({
  NewsletterCampaignComposer: () => <div data-testid="composer" />,
}));

const campaign = (over: Record<string, unknown> = {}) => ({
  id: 'c1',
  subject: 'Sedmični pregled',
  htmlBody: '',
  textBody: '',
  status: 'DRAFT',
  sentAt: null,
  sentCount: 0,
  failCount: 0,
  targetCount: 10,
  createdAt: '2026-01-02T10:00:00.000Z',
  ...over,
});

beforeEach(() => {
  state.permissions = ['newsletter.manage'];
  state.settings = { 'newsletter.blastEnabled': 'true' };
  state.campaigns = [];
  state.isLoading = false;
  state.confirm = vi.fn().mockResolvedValue(true);
  state.send = vi.fn().mockResolvedValue(undefined);
  state.isPending = false;
});

describe('NewsletterCampaignPanel', () => {
  it('upozorava da je slanje isključeno', () => {
    state.settings = { 'newsletter.blastEnabled': 'false' };
    render(<NewsletterCampaignPanel />);
    expect(screen.getByText(/Slanje je isključeno/)).toBeInTheDocument();
    expect(screen.getByText('newsletter.blastEnabled')).toBeInTheDocument();
  });

  it('sa uključenim slanjem nema upozorenja i prikazuje composer', () => {
    state.permissions = ['newsletter.manage'];
    render(<NewsletterCampaignPanel />);
    expect(screen.queryByText(/Slanje je isključeno/)).toBeNull();
    expect(screen.getByTestId('composer')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  it('bez dozvole nema composera ni akcija', () => {
    state.permissions = undefined;
    state.campaigns = [campaign()];
    render(<NewsletterCampaignPanel />);
    expect(screen.queryByTestId('composer')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Pošalji' })).toBeNull();
  });

  it('dok se učitava prikazuje poruku umjesto tabele', () => {
    state.isLoading = true;
    render(<NewsletterCampaignPanel />);
    expect(screen.getByText('Učitavanje…')).toBeInTheDocument();
  });

  it('prazna lista daje poruku', () => {
    render(<NewsletterCampaignPanel />);
    expect(screen.getByText('Nema kampanja.')).toBeInTheDocument();
  });

  it('nacrt prikazuje crtice i dugme za slanje', () => {
    state.campaigns = [campaign({ status: 'DRAFT' })];
    render(<NewsletterCampaignPanel />);
    expect(screen.getByText('Nacrt')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pošalji' })).toBeEnabled();
  });

  it('dugme za slanje je blokirano kad je blast isključen', () => {
    state.settings = { 'newsletter.blastEnabled': 'false' };
    state.campaigns = [campaign()];
    render(<NewsletterCampaignPanel />);
    expect(screen.getByRole('button', { name: 'Pošalji' })).toBeDisabled();
  });

  it('poslano prikazuje brojke bez trake napretka', () => {
    state.campaigns = [
      campaign({ status: 'SENT', sentCount: 8, failCount: 1, targetCount: 10 }),
    ];
    const { container } = render(<NewsletterCampaignPanel />);
    expect(screen.getByText('Poslano')).toBeInTheDocument();
    expect(screen.getByText('poslano 8/10 · čeka 1 · fail 1')).toBeInTheDocument();
    expect(container.querySelector('.bg-primary.h-full')).toBeNull();
  });

  it('slanje u toku prikazuje traku napretka i neuspjeli status', () => {
    state.campaigns = [
      campaign({ id: 'c2', status: 'SENDING', sentCount: 3, failCount: 2, targetCount: 10 }),
      campaign({ id: 'c3', status: 'FAILED', targetCount: 4 }),
    ];
    const { container } = render(<NewsletterCampaignPanel />);
    expect(screen.getByText('Šalje se')).toBeInTheDocument();
    expect(screen.getByText('Neuspjelo')).toBeInTheDocument();
    expect(screen.getByText('poslano 3/10 · čeka 5 · fail 2')).toBeInTheDocument();
    expect(container.querySelector('.bg-primary.h-full')).not.toBeNull();
  });

  it('ništa se ne šalje ako korisnik otkaže potvrdu', async () => {
    state.confirm = vi.fn().mockResolvedValue(false);
    state.campaigns = [campaign()];
    render(<NewsletterCampaignPanel />);
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji' }));
    expect(state.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Poslati kampanju svim aktivnim pretplatnicima?', description: 'Sedmični pregled' }),
    );
    expect(state.send).not.toHaveBeenCalled();
  });

  it('potvrda šalje kampanju', async () => {
    state.campaigns = [campaign()];
    render(<NewsletterCampaignPanel />);
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji' }));
    await waitFor(() => expect(state.send).toHaveBeenCalledWith('c1'));
  });
});
