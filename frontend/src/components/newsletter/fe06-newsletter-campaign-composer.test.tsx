import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsletterCampaignComposer } from './NewsletterCampaignComposer';
import { getActionError, resetActionErrorForTests } from '../../lib/action-errors';

const state = vi.hoisted(() => ({
  create: vi.fn(),
  createPending: false,
  preview: vi.fn(),
  previewPending: false,
}));

vi.mock('../../hooks/use-newsletter-campaigns', () => ({
  useCreateNewsletterCampaign: () => ({ mutateAsync: state.create, isPending: state.createPending }),
  usePreviewNewsletterCampaign: () => ({ mutateAsync: state.preview, isPending: state.previewPending }),
}));
vi.mock('../ui/switch', async () => ({
  Switch: (await import('../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('Naslov'), 'Novi naslov');
  await user.type(screen.getByPlaceholderText(/Tekst poruke/), 'Prvi pasus');
};

beforeEach(() => {
  state.create.mockReset();
  state.create.mockResolvedValue({});
  state.createPending = false;
  state.preview.mockReset();
  state.preview.mockResolvedValue({ html: '<p>Prvi pasus</p>' });
  state.previewPending = false;
});

describe('NewsletterCampaignComposer — početno stanje i validacija', () => {
  it('bez naslova i teksta oba dugmeta su onemogućena', () => {
    render(<NewsletterCampaignComposer />);
    expect(screen.getByRole('button', { name: 'Pregled' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Spremi nacrt' })).toBeDisabled();
  });

  it('samo razmaci ne aktiviraju dugmad', async () => {
    const user = userEvent.setup();
    render(<NewsletterCampaignComposer />);
    await user.type(screen.getByPlaceholderText('Naslov'), '   ');
    await user.type(screen.getByPlaceholderText(/Tekst poruke/), '   ');
    expect(screen.getByRole('button', { name: 'Spremi nacrt' })).toBeDisabled();
    expect(state.create).not.toHaveBeenCalled();
  });

  it('popunjeni naslov i tekst aktiviraju dugmad', async () => {
    const user = userEvent.setup();
    render(<NewsletterCampaignComposer />);
    await fill(user);
    expect(screen.getByRole('button', { name: 'Pregled' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Spremi nacrt' })).toBeEnabled();
  });
});

describe('NewsletterCampaignComposer — pregled', () => {
  it('pregled šalje očišćen sadržaj bez CTA polja', async () => {
    const user = userEvent.setup();
    render(<NewsletterCampaignComposer />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Pregled' }));
    await waitFor(() =>
      expect(state.preview).toHaveBeenCalledWith({
        subject: 'Novi naslov',
        textBody: 'Prvi pasus',
        ctaLabel: undefined,
        ctaUrl: undefined,
      }),
    );
    const frame = await screen.findByTitle('Pregled');
    expect(frame).toHaveAttribute('srcDoc', '<p>Prvi pasus</p>');
    expect(frame).toHaveAttribute('sandbox', '');
  });

  it('CTA uključen traži URL prije nego što dopusti slanje', async () => {
    const user = userEvent.setup();
    render(<NewsletterCampaignComposer />);
    await fill(user);
    await user.click(screen.getByRole('switch'));
    expect(screen.getByPlaceholderText('Tekst dugmeta')).toHaveValue('Saznaj više');
    expect(screen.getByPlaceholderText('https://…')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Spremi nacrt' })).toBeDisabled();
    await user.type(screen.getByPlaceholderText('https://…'), ' https://fkgracanica.ba ');
    expect(screen.getByRole('button', { name: 'Spremi nacrt' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Spremi nacrt' }));
    await waitFor(() =>
      expect(state.create).toHaveBeenCalledWith({
        subject: 'Novi naslov',
        textBody: 'Prvi pasus',
        ctaLabel: 'Saznaj više',
        ctaUrl: 'https://fkgracanica.ba',
      }),
    );
  });

  it('pregled u toku onemogućava oba dugmeta', async () => {
    const user = userEvent.setup();
    state.previewPending = true;
    render(<NewsletterCampaignComposer />);
    await fill(user);
    expect(screen.getByRole('button', { name: 'Pregled' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Spremi nacrt' })).toBeEnabled();
  });
});

describe('NewsletterCampaignComposer — spremanje nacrta', () => {
  it('spremanje čisti formu i uklanja pregled', async () => {
    const user = userEvent.setup();
    render(<NewsletterCampaignComposer />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Pregled' }));
    expect(await screen.findByTitle('Pregled')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Spremi nacrt' }));
    await waitFor(() => expect(state.create).toHaveBeenCalledTimes(1));
    expect(screen.getByPlaceholderText('Naslov')).toHaveValue('');
    expect(screen.getByPlaceholderText(/Tekst poruke/)).toHaveValue('');
    expect(screen.queryByTitle('Pregled')).toBeNull();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('spremanje u toku onemogućava dugme nacrta', async () => {
    const user = userEvent.setup();
    state.createPending = true;
    render(<NewsletterCampaignComposer />);
    await fill(user);
    expect(screen.getByRole('button', { name: 'Spremi nacrt' })).toBeDisabled();
  });

  it('izmijenjen tekst dugmeta ide u pregled i nacrt', async () => {
    const user = userEvent.setup();
    render(<NewsletterCampaignComposer />);
    await fill(user);
    await user.click(screen.getByRole('switch'));
    await user.clear(screen.getByPlaceholderText('Tekst dugmeta'));
    await user.type(screen.getByPlaceholderText('Tekst dugmeta'), 'Kupi kartu');
    await user.type(screen.getByPlaceholderText('https://…'), 'https://fkgracanica.ba');
    await user.click(screen.getByRole('button', { name: 'Spremi nacrt' }));
    await waitFor(() =>
      expect(state.create).toHaveBeenCalledWith({
        subject: 'Novi naslov', textBody: 'Prvi pasus', ctaLabel: 'Kupi kartu',
        ctaUrl: 'https://fkgracanica.ba',
      }),
    );
  });
});

describe('NewsletterCampaignComposer — tihe greške (P-FE06-44)', () => {
  beforeEach(() => {
    resetActionErrorForTests();
  });

  it('neuspješan nacrt prijavljuje poruku i ne čisti formu', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValue(new Error('Nacrt nije sačuvan'));
    render(<NewsletterCampaignComposer />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Spremi nacrt' }));
    expect(getActionError()).toMatchObject({ kind: 'message', message: 'Nacrt nije sačuvan' });
    expect(screen.getByPlaceholderText('Naslov')).toHaveValue('Novi naslov');
  });

  it('neuspješan pregled prijavljuje poruku bez pregleda', async () => {
    const user = userEvent.setup();
    state.preview.mockRejectedValue(new Error('Pregled nije izrađen'));
    render(<NewsletterCampaignComposer />);
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Pregled' }));
    expect(getActionError()).toMatchObject({ kind: 'message', message: 'Pregled nije izrađen' });
    expect(screen.queryByTitle('Pregled')).toBeNull();
  });
});

