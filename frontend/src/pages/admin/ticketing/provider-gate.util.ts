import type { ProviderGate } from '../../../types/ticketing-config';

export function providerGateBadge(gate: ProviderGate): {
  label: string;
  variant: 'success' | 'warning' | 'muted';
} {
  if (gate.checkoutReady) return { label: 'Spremno', variant: 'success' };
  if (gate.keysOk) return { label: 'Ključevi', variant: 'warning' };
  return { label: 'Nedostaje', variant: 'muted' };
}
