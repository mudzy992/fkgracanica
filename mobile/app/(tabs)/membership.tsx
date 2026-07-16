import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../src/lib/api';
import { QrCodeView } from '../../src/components/QrCodeView';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { formatDateBs } from '../../src/lib/format-date';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';
import type { Membership } from '../../src/types/api';

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
      await api.post('/membership/register');
      await loadMembership();
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <ScreenLoading />;

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

  if (active?.card) {
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
        <Text style={[styles.title, { color: colors.primary }]}>{t('membershipCard')}</Text>
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('cardNumber')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{active.card.cardNumber}</Text>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('status')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{active.status}</Text>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('validUntil')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{formatDateBs(active.endDate)}</Text>
        </View>
        <View style={styles.qrBox}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('qrCode')}</Text>
          <QrCodeView value={active.card.qrCode} size={220} />
          <Text style={[styles.qrHint, { color: colors.textMuted }]}>{t('qrHint')}</Text>
        </View>
      </ScrollView>
    );
  }

  const statusMsg =
    latest?.status === 'PENDING'
      ? t('membershipPending')
      : latest?.status === 'EXPIRED'
        ? t('membershipExpired')
        : latest?.status === 'SUSPENDED'
          ? t('membershipSuspended')
          : t('noMembership');

  return (
    <ScreenEmpty
      message={statusMsg}
      icon="id-card-outline"
      actionLabel={canRegister(latest?.status) ? (registering ? t('loading') : t('registerMembership')) : undefined}
      onAction={canRegister(latest?.status) ? () => void onRegister() : undefined}
    />
  );
}

export default function MembershipScreen() {
  return (
    <RequireAuth returnTo="/(tabs)/membership">
      <MembershipBody />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { ...typography.title, marginBottom: spacing.lg },
  card: {
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  label: { ...typography.caption, marginTop: spacing.sm },
  value: { ...typography.heading },
  qrBox: { alignItems: 'center' },
  qrHint: { ...typography.caption, marginTop: spacing.md },
});
