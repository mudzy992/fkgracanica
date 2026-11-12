import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { VideoEmbed } from './VideoEmbed';

describe('siguran prikaz YouTube videa', () => {
  it('prikazuje samo kanonski iframe uz valjan 11-znakovni ID i vrijeme', () => {
    render(<VideoEmbed url="https://youtu.be/abc123XYZ01" title="Snimak" startSeconds={75} />);
    const iframe = screen.getByTitle('Snimak');
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123XYZ01?start=75');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it.each([0, -1, NaN, Infinity, 0.5])('ne dodaje neispravno početno vrijeme %s', (startSeconds) => {
    render(<VideoEmbed url="https://youtu.be/abc123XYZ01" startSeconds={startSeconds} />);
    expect(screen.getByTitle('Video')).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123XYZ01');
  });
  it('objašnjava neispravan link i na engleskom', async () => {
    await i18n.changeLanguage('en');
    try {
      render(<VideoEmbed url="https://notyoutube.com/watch?v=abc123XYZ01" />);
      expect(screen.getByRole('status')).toHaveTextContent('Please check the YouTube link');
    } finally { await i18n.changeLanguage('bs'); }
  });
  it.each([
    'https://notyoutube.com/watch?v=abc123XYZ01',
    'https://youtube.com/watch?v=..%2F..%2Fredirect%3Fq%3Dhttps%3A%2F%2Fexample.invalid',
    'https://youtube.com/watch?v=',
  ])('ne učitava neispravan stari link, nego objašnjava problem: %s', (url) => {
    const { container } = render(<VideoEmbed url={url} />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Provjerite YouTube link');
  });
});
