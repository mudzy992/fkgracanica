import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../../src/components/RemoteImage';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { Screen } from '../../src/components/primitives/Screen';
import { api } from '../../src/lib/api';
import { asRecord, asString } from '../../src/lib/content-helpers';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

export default function PlayerScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [player, setPlayer] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(false);
      const { data } = await api.get(`/players/${id}/public`);
      setPlayer(asRecord(data));
    } catch {
      setPlayer(null);
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;
  if (error || !player) {
    return (
      <ScreenEmpty
        message={t('error')}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void load().finally(() => setLoading(false));
        }}
      />
    );
  }

  const displayName =
    [asString(player.firstName), asString(player.lastName)].filter(Boolean).join(' ') ||
    asString(player.name, '—');

  return (
    <Screen scroll>
      <RemoteImage path={asString(player.imagePath) || asString(player.photoPath)} style={styles.image} />
      <Text style={[styles.title, { color: colors.text }]}>{displayName}</Text>
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('position')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{asString(player.position, '-')}</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('number')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{asString(player.shirtNumber, '-')}</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('bio')}</Text>
        <Text style={[styles.bio, { color: colors.text }]}>{asString(player.bio, '—')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { height: 260 },
  title: { ...typography.title, marginTop: spacing.md },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  label: { ...typography.caption, marginTop: spacing.sm },
  value: { ...typography.heading },
  bio: { ...typography.body, marginTop: spacing.xs },
});
