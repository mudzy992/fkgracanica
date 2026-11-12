import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaInstallBanner } from './PwaInstallBanner';

const state = vi.hoisted(() => ({
  prompt: vi.fn(),
  outcome: 'accepted' as 'accepted' | 'dismissed',
}));

const STORAGE_KEY = 'fk_pwa_install_dismissed';

const firePrompt = async () => {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  Object.defineProperty(event, 'prompt', { value: state.prompt });
  Object.defineProperty(event, 'userChoice', {
    value: Promise.resolve({ outcome: state.outcome }),
  });
  await act(async () => {
    window.dispatchEvent(event);
  });
  return event;
};

const renderBanner = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PwaInstallBanner />
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
  state.prompt.mockReset().mockResolvedValue(undefined);
  state.outcome = 'accepted';
});

describe('PwaInstallBanner — prikaz', () => {
  it('bez beforeinstallprompt događaja ništa ne prikazuje', () => {
    const { container } = renderBanner();
    expect(container).toBeEmptyDOMElement();
  });

  it('nakon događaja prikazuje poziv i sprečava podrazumijevano ponašanje', async () => {
    renderBanner();
    const event = await firePrompt();
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByText('Instaliraj FK Gračanica na početni ekran.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ne sada' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Instaliraj' })).toBeInTheDocument();
  });

  it('na admin rutama se ne prikazuje ni sa događajem', async () => {
    const { container } = renderBanner('/admin/pocetna');
    await firePrompt();
    expect(container).toBeEmptyDOMElement();
  });

  it('ne prikazuje se ako je ranije odbijen', async () => {
    localStorage.setItem(STORAGE_KEY, '1');
    const { container } = renderBanner();
    await firePrompt();
    expect(container).toBeEmptyDOMElement();
  });

  it('uklanja osluškivač pri demontaži', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderBanner();
    unmount();
    expect(remove).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    remove.mockRestore();
  });
});

describe('PwaInstallBanner — interakcije', () => {
  it('„Ne sada“ pamti odluku i sakriva baner', async () => {
    const user = userEvent.setup();
    renderBanner();
    await firePrompt();
    await user.click(screen.getByRole('button', { name: 'Ne sada' }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(screen.queryByText(/Instaliraj FK Gračanica/)).toBeNull();
  });

  it('prihvaćena instalacija poziva prompt i pamti odluku', async () => {
    const user = userEvent.setup();
    renderBanner();
    await firePrompt();
    await user.click(screen.getByRole('button', { name: 'Instaliraj' }));
    expect(state.prompt).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(screen.queryByText(/Instaliraj FK Gračanica/)).toBeNull();
  });

  it('odbijena instalacija sakriva baner bez pamćenja odluke', async () => {
    const user = userEvent.setup();
    state.outcome = 'dismissed';
    renderBanner();
    await firePrompt();
    await user.click(screen.getByRole('button', { name: 'Instaliraj' }));
    expect(state.prompt).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.queryByText(/Instaliraj FK Gračanica/)).toBeNull();
  });
});
