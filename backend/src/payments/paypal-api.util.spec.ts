import {
  formatPaypalAmount,
  parsePaypalCustomId,
  paypalApproveUrl,
  paypalBaseUrl,
  paypalCustomId,
  withPaypalReturnUrl,
} from './paypal-api.util';
import {
  extractPaypalCustomId,
  extractPaypalOrderId,
  paypalWebhookShouldCapture,
} from './paypal-webhook.util';

describe('paypal-api.util', () => {
  it('sandbox vs live base', () => {
    expect(paypalBaseUrl('sandbox')).toContain('sandbox');
    expect(paypalBaseUrl('live')).toBe('https://api-m.paypal.com');
  });

  it('formats amount', () => {
    expect(formatPaypalAmount(15)).toBe('15.00');
  });

  it('custom id roundtrip', () => {
    expect(parsePaypalCustomId(paypalCustomId('tickets', 'ord1'))).toEqual({
      kind: 'tickets',
      id: 'ord1',
    });
    expect(parsePaypalCustomId(paypalCustomId('membership', 'mem1'))).toEqual({
      kind: 'membership',
      id: 'mem1',
    });
    expect(parsePaypalCustomId(paypalCustomId('season', 'pass1'))).toEqual({
      kind: 'season',
      id: 'pass1',
    });
  });

  it('approve link', () => {
    expect(
      paypalApproveUrl([
        { rel: 'self', href: 'https://x' },
        { rel: 'approve', href: 'https://paypal.com/ok' },
      ]),
    ).toBe('https://paypal.com/ok');
  });

  it('return url sets provider and drops session_id', () => {
    const url = withPaypalReturnUrl('https://x.test/ulaznice?paid=1&session_id={CHECKOUT_SESSION_ID}');
    expect(url).toContain('provider=paypal');
    expect(url).not.toContain('session_id');
  });
});

describe('paypal-webhook.util', () => {
  it('extracts order id from CHECKOUT.ORDER.APPROVED', () => {
    expect(
      extractPaypalOrderId({
        event_type: 'CHECKOUT.ORDER.APPROVED',
        resource: { id: 'ORDER-1', purchase_units: [{ custom_id: 't:abc' }] },
      }),
    ).toBe('ORDER-1');
    expect(paypalWebhookShouldCapture('CHECKOUT.ORDER.APPROVED')).toBe(true);
  });

  it('extracts order id from capture supplementary_data', () => {
    expect(
      extractPaypalOrderId({
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {
          id: 'CAP-1',
          custom_id: 'm:mem',
          supplementary_data: { related_ids: { order_id: 'ORDER-9' } },
        },
      }),
    ).toBe('ORDER-9');
    expect(extractPaypalCustomId({ resource: { custom_id: 'm:mem' } })).toEqual({
      kind: 'membership',
      id: 'mem',
    });
  });
});
