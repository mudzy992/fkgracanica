import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher';

const state = vi.hoisted(() => ({
  changeLanguage: vi.fn(),
  persist: vi.fn(),
  language: 'bs' as string | undefined,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: () => 'Jezik',
    i18n: { resolvedLanguage: state.language, changeLanguage: state.changeLanguage },
  }),
}));
vi.mock('../../lib/i18n-lang', () => ({ persistLanguage: state.persist }));

beforeEach(() => {
  state.language = 'bs';
  state.changeLanguage.mockClear();
  state.persist.mockClear();
});

describe('LanguageSwitcher', () => {
  it('uključuje vidljivi ciljni jezik u dostupno ime', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'Jezik: EN' })).toHaveTextContent('EN');
  });

  it('klik mijenja jezik i pamti izbor', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);
    await user.click(screen.getByRole('button', { name: 'Jezik: EN' }));
    expect(state.changeLanguage).toHaveBeenCalledWith('en');
    expect(state.persist).toHaveBeenCalledWith('en');
  });

  it('engleski jezik nudi povratak na bosanski (batch 34)', async () => {
    const user = userEvent.setup();
    state.language = 'en';
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: 'Jezik: BS' });
    expect(button).toHaveTextContent('BS');
    await user.click(button);
    expect(state.changeLanguage).toHaveBeenCalledWith('bs');
    expect(state.persist).toHaveBeenCalledWith('bs');
  });

  it('nerazriješen jezik se tretira kao bosanski (batch 34)', () => {
    state.language = undefined;
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'Jezik: EN' })).toBeInTheDocument();
  });
});
