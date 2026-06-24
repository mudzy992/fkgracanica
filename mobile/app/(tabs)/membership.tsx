import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../src/lib/api';
import { colors, spacing, typography } from '../../src/lib/theme';
import type { Membership } from '../../src/types/api';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('bs-BA');
}

export default function MembershipScreen() {
  const { t } = useTranslation();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!active?.card) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{t('noMembership')}</Text>
      </View>
    );
  }

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

        <Text style={styles.label}>Važi do</Text>
        <Text style={styles.value}>{formatDate(active.endDate)}</Text>
      </View>

      <View style={styles.qrBox}>
        <Text style={styles.label}>{t('qrCode')}</Text>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrCode} selectable>
            {active.card.qrCode}
          </Text>
        </View>
        <Text style={styles.qrHint}>Pokažite ovaj kod na ulazu</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
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
  qrPlaceholder: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
    minWidth: 220,
    alignItems: 'center',
  },
  qrCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  qrHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
  empty: { color: colors.textMuted, textAlign: 'center' },
});
