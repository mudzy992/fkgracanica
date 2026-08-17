import type { ReactNode } from 'react';

export function PaymentProviderHints() {
  return (
    <div className="space-y-3">
      <Hint title="Stripe test (demo)">
        U Stripe Dashboardu uključite Test mode i unesite pk_test i sk_test ključeve. Test kartica:{' '}
        <strong>4242 4242 4242 4242</strong>.
        <span className="mt-2 block text-xs">
          Webhook lokalno: stripe listen --forward-to localhost:3000/payments/webhooks/stripe
        </span>
      </Hint>
      <Hint title="PayPal sandbox">
        developer.paypal.com → App → Client ID i Secret. Mode: sandbox. Charge ide u EUR (isti broj
        kao KM na narudžbi). Webhook ID obavezan za server callback; povratak na portal radi i bez
        njega.
        <span className="mt-2 block text-xs">Webhook: POST /payments/webhooks/paypal</span>
      </Hint>
      <Hint title="Monri test">
        Test IPG: ipgtest.monri.com/v2/form. Live: ipg.monri.com. Merchant key + authenticity token.
        Mode: test. Valuta BAM, iznos u feningima. Bridge: /placanje/monri.
        <span className="mt-2 block text-xs">Callback: POST /payments/webhooks/monri</span>
      </Hint>
    </div>
  );
}

function Hint({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-surface/50 p-4 text-sm text-text-muted">
      <p className="font-medium text-text">{title}</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}
