import {
  campaignFinalStatus,
  htmlToText,
  unsubscribeUrl,
  withUnsubscribeFooter,
} from './newsletter-campaign.util';

describe('newsletter-campaign.util', () => {
  it('builds unsubscribe url', () => {
    expect(unsubscribeUrl('https://x.test', 'tok')).toBe(
      'https://x.test/newsletter/unsubscribe?token=tok',
    );
  });

  it('appends footer', () => {
    const html = withUnsubscribeFooter('<p>Hi</p>', 'https://x.test', 'ab');
    expect(html).toContain('token=ab');
    expect(html).toContain('Odjava');
  });

  it('strips html', () => {
    expect(htmlToText('<p>A <b>B</b></p>')).toBe('A B');
  });

  it('final status', () => {
    expect(campaignFinalStatus(1, 0, 2)).toBeNull();
    expect(campaignFinalStatus(2, 0, 2)).toBe('SENT');
    expect(campaignFinalStatus(1, 1, 2)).toBe('SENT');
    expect(campaignFinalStatus(0, 2, 2)).toBe('FAILED');
  });
});
