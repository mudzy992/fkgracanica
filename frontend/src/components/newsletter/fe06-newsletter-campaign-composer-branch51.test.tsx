import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewsletterCampaignComposer } from './NewsletterCampaignComposer';

const mutateAsync = vi.fn().mockResolvedValue({ html: '<p>hi</p>' });
const createMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('../../hooks/use-newsletter-campaigns', () => ({
  useCreateNewsletterCampaign: () => ({ mutateAsync: createMutateAsync, isPending: false }),
  usePreviewNewsletterCampaign: () => ({ mutateAsync, isPending: false }),
}));
vi.mock('../../lib/action-errors', async () => {
  const actual = await vi.importActual('../../lib/action-errors') as any;
  return { ...actual };
});

describe('NewsletterCampaignComposer — branch51 (early return)', () => {
  beforeEach(() => { vi.clearAllMocks(); mutateAsync.mockResolvedValue({ html: '<p>hi</p>' }); });

  it('onPreview early return kada subject prazan (bypass disabled)', async () => {
    render(<NewsletterCampaignComposer />);
    const btn = screen.getByText('Pregled') as HTMLButtonElement;
    // subject i textBody prazni, ready false pa disabled, uklanjamo disabled da bi onPreview bio pozvan
    btn.removeAttribute('disabled');
    fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 10));
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('onCreate early return kada textBody prazan', async () => {
    render(<NewsletterCampaignComposer />);
    // popunimo samo subject, ostavimo textBody prazan
    const inputs = screen.getAllByPlaceholderText(/Naslov|Tekst poruke|https/);
    const subj = screen.getByPlaceholderText('Naslov') as HTMLInputElement;
    fireEvent.change(subj, { target: { value: 'Subj' } });
    const btn = screen.getByText('Spremi nacrt') as HTMLButtonElement;
    btn.removeAttribute('disabled');
    fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 10));
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it('uspješan preview postavlja html', async () => {
    render(<NewsletterCampaignComposer />);
    fireEvent.change(screen.getByPlaceholderText('Naslov'), { target: { value: 'Naslov' } });
    fireEvent.change(screen.getByPlaceholderText(/Tekst poruke/), { target: { value: 'Body text' } });
    const btn = screen.getByText('Pregled') as HTMLButtonElement;
    // sada je ready true, dugme enabled
    fireEvent.click(btn);
    await screen.findByTitle('Pregled');
    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Naslov' }));
  });

  it('ctaOn grane: ready zahtijeva ctaUrl kada ctaOn true', async () => {
    render(<NewsletterCampaignComposer />);
    fireEvent.change(screen.getByPlaceholderText('Naslov'), { target: { value: 'Subj' } });
    fireEvent.change(screen.getByPlaceholderText(/Tekst poruke/), { target: { value: 'Body' } });
    // uključimo cta
    const sw = document.querySelector('[role="switch"]') as HTMLElement | null;
    if (sw) fireEvent.click(sw);
    // sada ctaOn true ali ctaUrl prazan => ready false => preview disabled
    const previewBtn = screen.getByText('Pregled') as HTMLButtonElement;
    expect(previewBtn.disabled).toBe(true);
    // popunimo url
    const urlInput = screen.getByPlaceholderText('https://…') as HTMLInputElement;
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    expect(screen.getByText('Pregled').closest('button')?.disabled).toBe(false);
  });
});
