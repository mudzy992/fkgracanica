import { api } from '../../lib/api';
import { startMobileCheckout, type CheckoutResult } from '../../lib/start-mobile-checkout';
import type { TicketingConfig } from '../../types/api';

export async function payMembershipOnline(membershipId: string): Promise<CheckoutResult | 'skipped'> {
  const { data } = await api.get<TicketingConfig>('/ticketing/config');
  const amount = data.membershipAnnualPrice ?? 0;
  const online = Boolean(data.membershipOnlineEnabled && data.onlineReady && amount > 0);
  if (!online) return 'skipped';
  return startMobileCheckout({
    kind: 'membership',
    body: { membershipId, amount },
  });
}
