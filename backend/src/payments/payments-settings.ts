import { SettingScope, SettingType } from '@prisma/client';

const priv = SettingScope.PRIVATE;
const str = SettingType.STRING;
const bool = SettingType.BOOLEAN;

function s(
  key: string,
  value: string,
  type: SettingType,
  description: string,
  scope: SettingScope = priv,
) {
  return { key, value, type, scope, description, managedIn: 'ticketing' as const };
}

export const PAYMENTS_SETTINGS = [
  s('payments.stripe.enabled', 'false', bool, 'Stripe omogućen'),
  s('payments.stripe.secretKey', '', str, 'Stripe secret key'),
  s('payments.stripe.webhookSecret', '', str, 'Stripe webhook secret'),
  s('payments.stripe.publishableKey', '', str, 'Stripe publishable key', SettingScope.PUBLIC),
  s('payments.paypal.enabled', 'false', bool, 'PayPal omogućen'),
  s('payments.paypal.clientId', '', str, 'PayPal client ID'),
  s('payments.paypal.clientSecret', '', str, 'PayPal client secret'),
  s('payments.paypal.mode', 'sandbox', str, 'PayPal mode: sandbox | live'),
  s('payments.paypal.currency', 'EUR', str, 'PayPal charge currency (BAM nije pouzdan)'),
  s('payments.paypal.webhookId', '', str, 'PayPal webhook ID (opciono)'),
  s('payments.monri.enabled', 'false', bool, 'Monri omogućen'),
  s('payments.monri.merchantKey', '', str, 'Monri merchant key'),
  s('payments.monri.authenticationKey', '', str, 'Monri authenticity token'),
  s('payments.monri.mode', 'test', str, 'Monri mode: test | live'),
  s('payments.defaultProvider', 'stripe', str, 'Default payment provider'),
];

export const PAYMENTS_ADMIN_KEYS = PAYMENTS_SETTINGS.map((row) => row.key) as readonly string[];
