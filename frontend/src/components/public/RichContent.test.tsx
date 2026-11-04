import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { RichContent } from './RichContent';

describe('objašnjenje neispravnog ugrađenog videa', () => {
  it('ne kreira iframe i prikazuje korisniku objašnjenje', () => {
    const { container } = render(<RichContent html={'<p>Test</p><iframe src="https://www.youtube.com/embed/../../redirect?q=https://example.invalid/"></iframe>'} />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Ugrađeni video nije dostupan');
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  it('objašnjenje prevodi i na engleski', async () => {
    await i18n.changeLanguage('en');
    try {
      render(<RichContent html={'<iframe src="https://www.youtube.com/redirect"></iframe>'} />);
      expect(screen.getByRole('status')).toHaveTextContent('Embedded video unavailable');
    } finally {
      await i18n.changeLanguage('bs');
    }
  });
});
