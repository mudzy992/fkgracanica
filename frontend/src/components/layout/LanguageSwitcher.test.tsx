import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher';

const state = vi.hoisted(() => ({ changeLanguage: vi.fn(), persist: vi.fn() }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: () => 'Jezik',
    i18n: { resolvedLanguage: 'bs', changeLanguage: state.changeLanguage },
  }),
}));
vi.mock('../../lib/i18n-lang', () => ({ persistLanguage: state.persist }));

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
});
