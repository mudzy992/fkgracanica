import { Vibration } from 'react-native';
import { api } from '../../lib/api';
import type { AdmissionOutcome } from './map-ticket-validate';

export function isSameLockedQr(locked: string | null, next: string): boolean {
  return Boolean(locked && next && locked === next);
}

export function postAdmissionScan(
  path: 'inspect' | 'validate',
  qrCode: string,
  matchId?: string,
) {
  return api.post(`/ticketing/${path}`, { qrCode, matchId });
}

export function playAdmissionFeedback(outcome: AdmissionOutcome): void {
  if (outcome === 'valid') {
    Vibration.vibrate(240);
    return;
  }
  Vibration.vibrate([0, 100, 70, 100]);
}
