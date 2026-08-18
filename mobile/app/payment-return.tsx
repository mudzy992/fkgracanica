import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScreenLoading } from '../src/components/ScreenLoading';
import { api } from '../src/lib/api';
import { parseCheckoutKind } from '../src/lib/start-mobile-checkout';
import { useAuth } from '../src/lib/auth';

const DEST = {
  tickets: '/(tabs)/tickets',
  membership: '/(tabs)/membership',
  season: '/(tabs)/tickets',
} as const;

const CONFIRM = {
  tickets: '/payments/tickets/confirm-session',
  membership: '/payments/membership/confirm-session',
  season: '/payments/season-pass/confirm-session',
} as const;

export default function PaymentReturnScreen() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const params = useLocalSearchParams<{ kind?: string; session_id?: string; cancelled?: string }>();

  useEffect(() => {
    if (isLoading) return;
    const kind = parseCheckoutKind(params.kind);
    const target = DEST[kind];
    void (async () => {
      try {
        if (params.cancelled !== '1' && params.session_id) {
          await api.post(CONFIRM[kind], { sessionId: params.session_id, provider: 'stripe' });
        }
      } finally {
        router.replace(target);
      }
    })();
  }, [isLoading, params.cancelled, params.kind, params.session_id, router]);

  return <ScreenLoading />;
}
