import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n';
import { MatchHighlightsEditor } from './MatchHighlightsEditor';

const state = vi.hoisted(() => ({
  create: vi.fn(),
  remove: vi.fn(),
  confirm: vi.fn(),
  highlights: [] as Array<{ id: string; title: string }>,
}));

vi.mock('../../../hooks', () => ({
  useMatch: () => ({ data: { highlights: state.highlights } }),
}));
vi.mock('../../../hooks/use-match-highlights', () => ({
  useCreateMatchHighlight: () => ({ mutateAsync: state.create, isPending: false }),
  useDeleteMatchHighlight: () => ({ mutateAsync: state.remove, isPending: false }),
}));
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));

beforeEach(() => {
  state.create = vi.fn().mockResolvedValue({});
  state.remove = vi.fn().mockResolvedValue({});
  state.confirm = vi.fn().mockResolvedValue(true);
  state.highlights = [];
});

const fill = (title = 'Klip', url = 'https://youtu.be/abc123XYZ01') => {
  fireEvent.change(screen.getByPlaceholderText('Naslov klipa'), { target: { value: title } });
  fireEvent.change(screen.getByPlaceholderText('YouTube URL'), { target: { value: url } });
};

describe('MatchHighlightsEditor — lista i brisanje', () => {
  it('prikazuje postojeće klipove', () => {
    state.highlights = [
      { id: 'h1', title: 'Prvi gol' },
      { id: 'h2', title: 'Odbrana' },
    ];
    render(<MatchHighlightsEditor matchId="m" />);
    expect(screen.getByText('Prvi gol')).toBeInTheDocument();
    expect(screen.getByText('Odbrana')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Obriši' })).toHaveLength(2);
  });

  it('brisanje traži potvrdu i briše nakon odobrenja', async () => {
    state.highlights = [{ id: 'h1', title: 'Prvi gol' }];
    render(<MatchHighlightsEditor matchId="m" />);
    fireEvent.click(screen.getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith('h1'));
    expect(state.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'danger', confirmLabel: 'Obriši' }),
    );
  });

  it('otkazana potvrda ne briše klip', async () => {
    state.confirm.mockResolvedValue(false);
    state.highlights = [{ id: 'h1', title: 'Prvi gol' }];
    render(<MatchHighlightsEditor matchId="m" />);
    fireEvent.click(screen.getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.remove).not.toHaveBeenCalled();
  });

  it('greška spremanja klipa se prikazuje u alertu', async () => {
    state.create.mockRejectedValue(new Error('Server pao'));
    render(<MatchHighlightsEditor matchId="m" />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj klip' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server pao');
  });

  it('uspješno dodavanje čisti polja', async () => {
    render(<MatchHighlightsEditor matchId="m" />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj klip' }));
    await waitFor(() => expect(state.create).toHaveBeenCalled());
    expect(screen.getByPlaceholderText('Naslov klipa')).toHaveValue('');
    expect(screen.getByPlaceholderText('YouTube URL')).toHaveValue('');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('bez naslova ili linka dugme je onemogućeno', () => {
    render(<MatchHighlightsEditor matchId="m" />);
    expect(screen.getByRole('button', { name: 'Dodaj klip' })).toBeDisabled();
    fill('Samo naslov', '');
    expect(screen.getByRole('button', { name: 'Dodaj klip' })).toBeDisabled();
  });
});
