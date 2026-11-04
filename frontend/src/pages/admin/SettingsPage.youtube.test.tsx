import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { SettingsPage } from './SettingsPage';

const legacy = 'https://notyoutube.com/watch?v=abc123XYZ01';
const state = vi.hoisted(() => ({
  save: vi.fn(),
  data: { 'feature.live': 'true', 'live.prematchAudioUrl': 'https://notyoutube.com/watch?v=abc123XYZ01', 'club.name': 'Prije' },
}));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: state.data }),
  usePrivateSettings: () => ({ data: {} }),
  useUpdatePublicSettings: () => ({ mutateAsync: state.save, isPending: false }),
  useUpdatePrivateSettings: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['settings.update'] } }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
beforeEach(() => { state.save.mockReset().mockResolvedValue({}); });

function openLive() {
  render(<SettingsPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Live centar' }));
  return screen.getByRole('textbox', { name: 'Pre-match audio (YouTube)' });
}
function save() { fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj promjene' })); }

describe('postavka prematch audija', () => {
  it('pristupačno odbija novi neispravni link i prihvata ispravan nakon ispravke', async () => {
    const input = openLive();
    fireEvent.change(input, { target: { value: 'https://youtu.be/short' } });
    save();
    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent('Unesite ispravan YouTube link');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(state.save).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'https://youtu.be/abc123XYZ01' } });
    save();
    await waitFor(() => expect(state.save).toHaveBeenCalledWith({ 'live.prematchAudioUrl': 'https://youtu.be/abc123XYZ01' }));
  });
  it('dozvoljava ostale promjene uz nepromijenjenu staru neispravnu vrijednost', async () => {
    const input = openLive();
    fireEvent.change(input, { target: { value: 'https://youtu.be/short' } });
    fireEvent.change(input, { target: { value: legacy } });
    fireEvent.click(screen.getByRole('button', { name: 'Identitet kluba' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Naziv kluba' }), { target: { value: 'Poslije' } });
    save();
    await waitFor(() => expect(state.save).toHaveBeenCalledWith({ 'live.prematchAudioUrl': legacy, 'club.name': 'Poslije' }));
  });
  it('dozvoljava ručno uklanjanje', async () => {
    const input = openLive();
    fireEvent.change(input, { target: { value: '' } });
    save();
    await waitFor(() => expect(state.save).toHaveBeenCalledWith({ 'live.prematchAudioUrl': '' }));
  });
});
