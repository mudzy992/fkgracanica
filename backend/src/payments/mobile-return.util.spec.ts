import { buildMobileReturnUrl, isAllowedAppReturn } from './mobile-return.util';

describe('mobile-return.util', () => {
  it('allows app and Expo schemes only', () => {
    expect(isAllowedAppReturn('fkgracanica://payment-return')).toBe(true);
    expect(isAllowedAppReturn('exp://192.168.0.8:8081/--/payment-return')).toBe(
      true,
    );
    expect(isAllowedAppReturn('https://fkgracanica.ba101.top/ulaznice')).toBe(
      false,
    );
  });

  it('appends Stripe params onto the app return URL', () => {
    const url = buildMobileReturnUrl({
      to: 'fkgracanica://payment-return',
      kind: 'tickets',
      paid: '1',
      session_id: 'cs_test',
    });
    expect(url).toContain('fkgracanica://payment-return?');
    expect(url).toContain('kind=tickets');
    expect(url).toContain('session_id=cs_test');
  });
});
