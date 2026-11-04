import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n';
import { MatchHighlightsEditor } from './MatchHighlightsEditor';

const mocks = vi.hoisted(() => ({ create: vi.fn(), remove: vi.fn() }));
vi.mock('../../../hooks', () => ({ useMatch: () => ({ data: { highlights: [] } }) }));
vi.mock('../../../hooks/use-match-highlights', () => ({
  useCreateMatchHighlight: () => ({ mutateAsync: mocks.create, isPending: false }),
  useDeleteMatchHighlight: () => ({ mutateAsync: mocks.remove, isPending: false }),
}));
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: vi.fn(), dialog: null }),
}));

beforeEach(() => {
  mocks.create.mockReset().mockResolvedValue({});
});

describe('unos highlight YouTube linka', () => {
  it('ne šalje lažnu domenu i objašnjava kako ispraviti unos', async () => {
    render(<MatchHighlightsEditor matchId="match" />);
    fireEvent.change(screen.getByPlaceholderText('Naslov klipa'), { target: { value: 'Klip' } });
    fireEvent.change(screen.getByPlaceholderText('YouTube URL'), { target: { value: 'https://notyoutube.com/watch?v=abc123XYZ01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj klip' }));
    const error = await screen.findByRole('alert');
    const input = screen.getByPlaceholderText('YouTube URL');
    expect(error).toHaveTextContent('Unesite ispravan YouTube link');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(mocks.create).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'https://youtu.be/abc123XYZ01' } });
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('šalje valjani live link i zadržava uneseno vrijeme', async () => {
    render(<MatchHighlightsEditor matchId="match" />);
    fireEvent.change(screen.getByPlaceholderText('Naslov klipa'), { target: { value: 'Klip' } });
    fireEvent.change(screen.getByPlaceholderText('YouTube URL'), { target: { value: ' https://youtube.com/live/abc123XYZ01 ' } });
    fireEvent.change(screen.getByPlaceholderText('Početak (sekunde, opcionalno)'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj klip' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({ title: 'Klip', youtubeUrl: 'https://youtube.com/live/abc123XYZ01', startSeconds: 30 }));
  });
});
