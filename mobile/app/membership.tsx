import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { api } from '../src/lib/api';
import { MembershipCardVisual } from '../src/components/membership/MembershipCardVisual';
import { payMembershipOnline } from '../src/components/membership/pay-membership-online';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { PrimaryButton } from '../src/components/primitives/PrimaryButton';
import { RequireAuth } from '../src/components/RequireAuth';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { useTheme } from '../src/lib/theme-context';
import { spacing } from '../src/lib/theme';
import type { Membership } from '../src/types/api';

function canRegister(status: string | undefined): boolean {
  return !status || status === 'EXPIRED' || status === 'CANCELLED';
}

function MembershipBody() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembership = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get<Membership[]>('/membership/me');
      setMemberships(data);
    } catch {
      setMemberships([]);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void loadMembership().finally(() => setLoading(false));
  }, [loadMembership]);

  const active = memberships.find((m) => m.status === 'ACTIVE' && m.card);
  const latest = memberships[0];

  const onRegister = async () => {
    setRegistering(true);
    try {
      const { data } = await api.post<Membership>('/membership/register');
      if (data?.id) {
        const result = await payMembershipOnline(data.id);
        if (result === 'cancelled') setError(t('paymentCancelled'));
      }
      await loadMembership();
    } catch {
      setError(t('paymentFailed'));
    } finally {
      setRegistering(false);
    }
  };

  const onPayPending = async () => {
    if (!latest?.id) return;
    setRegistering(true);
    try {
      const result = await payMembershipOnline(latest.id);
      if (result === 'cancelled') setError(t('paymentCancelled'));
      await loadMembership();
    } catch {
      setError(t('paymentFailed'));
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <ListSkeleton rows={3} />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void loadMembership().finally(() => setLoading(false));
        }}
      />
    );
  }

  const statusMsg =
    latest?.status === 'PENDING'
      ? t('membershipPending')
      : latest?.status === 'EXPIRED'
        ? t('membershipExpired')
        : latest?.status === 'SUSPENDED'
          ? t('membershipSuspended')
          : latest?.status === 'CANCELLED'
            ? t('membershipCancelled')
            : t('noMembership');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadMembership().finally(() => setRefreshing(false));
          }}
        />
      }
    >
      {active?.card ? (
        <MembershipCardVisual membership={active} />
      ) : (
        <>
          <ScreenEmpty
            compact
            message={statusMsg}
            icon="id-card-outline"
            actionLabel={canRegister(latest?.status) ? t('registerMembership') : undefined}
            onAction={canRegister(latest?.status) ? () => void onRegister() : undefined}
          />
          {latest?.status === 'PENDING' ? (
            <PrimaryButton label={t('payOnline')} loading={registering} onPress={() => void onPayPending()} />
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

export default function MembershipScreen() {
  const { t } = useTranslation();
  return (
    <RequireAuth returnTo="/membership">
      <Stack.Screen options={{ title: t('membership') }} />
      <MembershipBody />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
});
