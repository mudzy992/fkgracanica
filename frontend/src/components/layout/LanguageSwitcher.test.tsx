import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: () => 'Jezik',
    i18n: { resolvedLanguage: 'bs', changeLanguage: vi.fn() },
  }),
}));

describe('LanguageSwitcher accessibility', () => {
  it('uključuje vidljivi ciljni jezik u dostupno ime', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'Jezik: EN' })).toHaveTextContent('EN');
  });
});
