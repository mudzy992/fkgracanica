import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n';
import { installDialogPolyfill } from '../../../test/dialog-polyfill';
import type { Match } from '../../../types';
import { CommentatorStreamDialog } from './CommentatorStreamDialog';

const save = vi.hoisted(() => vi.fn());
vi.mock('../../../hooks/use-live-admin', () => ({ useSetLiveStream: () => ({ mutateAsync: save, isPending: false }) }));
installDialogPolyfill();
beforeEach(() => { save.mockReset().mockResolvedValue({}); });

function open(url: string | null = null) {
  render(<CommentatorStreamDialog match={{ id: 'm', liveStreamUrl: url } as Match} />);
  fireEvent.click(screen.getByRole('button', { name: /stream/i }));
  return screen.getByPlaceholderText('https://youtube.com/watch?v=...');
}

describe('live stream editor', () => {
  it('ne šalje lažni URL i objašnjava grešku', async () => {
    const input = open();
    fireEvent.change(input, { target: { value: 'https://notyoutube.com/watch?v=abc123XYZ01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unesite ispravan YouTube link');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(save).not.toHaveBeenCalled();
  });
  it('ne dira nepromijenjeni stari neispravni link', async () => {
    open('https://notyoutube.com/watch?v=abc123XYZ01');
    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(save).not.toHaveBeenCalled();
  });
  it('zadržava mogućnost eksplicitnog uklanjanja', async () => {
    open('https://youtube.com/live/abc123XYZ01');
    fireEvent.click(screen.getByRole('button', { name: 'Ukloni' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ matchId: 'm', url: null }));
  });
  it('ne zatvara dijalog ako API odbije spremanje', async () => {
    save.mockRejectedValue(new Error('Testna API greška'));
    const input = open();
    fireEvent.change(input, { target: { value: 'https://youtu.be/abc123XYZ01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Testna API greška');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
