import { renderNewsletterHtml, escapeHtml, textToParagraphs } from './newsletter-email.template';

describe('newsletter-email.template', () => {
  it('escapes html in body and subject', () => {
    const html = renderNewsletterHtml({
      clubName: 'FK <X>',
      subject: 'Hello <b>',
      textBody: 'Line & more\n\nSecond',
      unsubscribeUrl: 'https://x.test/u?token=ab',
    });
    expect(html).toContain('FK &lt;X&gt;');
    expect(html).toContain('Hello &lt;b&gt;');
    expect(html).toContain('Line &amp; more');
    expect(html).not.toContain('<b>');
    expect(html).toContain('token=ab');
  });

  it('renders optional CTA and skips empty', () => {
    const withCta = renderNewsletterHtml({
      clubName: 'FK',
      subject: 'T',
      textBody: 'Hi',
      ctaLabel: 'Otvori',
      ctaUrl: 'https://fkgracanica.ba',
      unsubscribeUrl: 'https://x.test/u',
    });
    expect(withCta).toContain('Otvori');
    expect(withCta).toContain('https://fkgracanica.ba');
    const noCta = renderNewsletterHtml({
      clubName: 'FK',
      subject: 'T',
      textBody: 'Hi',
      unsubscribeUrl: 'https://x.test/u',
    });
    expect(noCta).not.toContain('inline-block');
  });

  it('splits paragraphs', () => {
    expect(textToParagraphs('A\n\nB')).toContain('>A<');
    expect(textToParagraphs('A\n\nB')).toContain('>B<');
    expect(escapeHtml('<x>')).toBe('&lt;x&gt;');
  });
});
