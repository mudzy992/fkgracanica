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
import { colors, spacing, typography } from '../../src/lib/theme';
import type { Membership } from '../../src/types/api';

function canRegister(status: string | undefined): boolean {
  return !status || status === 'EXPIRED' || status === 'CANCELLED';
}

function MembershipBody() {
  const { t } = useTranslation();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);

  const loadMembership = useCallback(async () => {
    try {
      const { data } = await api.get<Membership[]>('/membership/me');
      setMemberships(data);
    } catch {
      setMemberships([]);
    }
  }, []);

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

  if (active?.card) {
    return (
      <ScrollView
        style={styles.container}
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
        <Text style={styles.title}>{t('membershipCard')}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t('cardNumber')}</Text>
          <Text style={styles.value}>{active.card.cardNumber}</Text>
          <Text style={styles.label}>{t('status')}</Text>
          <Text style={styles.value}>{active.status}</Text>
          <Text style={styles.label}>{t('validUntil')}</Text>
          <Text style={styles.value}>{formatDateBs(active.endDate)}</Text>
        </View>
        <View style={styles.qrBox}>
          <Text style={styles.label}>{t('qrCode')}</Text>
          <QrCodeView value={active.card.qrCode} size={220} />
          <Text style={styles.qrHint}>{t('qrHint')}</Text>
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
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg },
  title: { ...typography.title, color: colors.primary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  label: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  value: { ...typography.heading, color: colors.text },
  qrBox: { alignItems: 'center' },
  qrHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
});
