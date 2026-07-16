import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../../src/components/RemoteImage';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { Screen } from '../../src/components/primitives/Screen';
import { api } from '../../src/lib/api';
import { asRecord, asString } from '../../src/lib/content-helpers';
import { colors, spacing, typography } from '../../src/lib/theme';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [player, setPlayer] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/players/${id}/public`);
      setPlayer(asRecord(data));
    } catch {
      setPlayer({});
    }
  }, [id]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;

  return (
    <Screen scroll>
      <RemoteImage path={asString(player.imagePath) || asString(player.photoPath)} style={styles.image} />
      <Text style={styles.title}>
        {[asString(player.firstName), asString(player.lastName)].filter(Boolean).join(' ') || asString(player.name, 'Igrač')}
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Pozicija</Text>
        <Text style={styles.value}>{asString(player.position, '-')}</Text>
        <Text style={styles.label}>Broj</Text>
        <Text style={styles.value}>{asString(player.shirtNumber, '-')}</Text>
        <Text style={styles.label}>Biografija</Text>
        <Text style={styles.bio}>{asString(player.bio, 'Profil igrača nije dopunjen.')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { height: 260 },
  title: { ...typography.title, color: colors.text, marginTop: spacing.md },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  label: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  value: { ...typography.heading, color: colors.text },
  bio: { ...typography.body, color: colors.text, marginTop: spacing.xs },
});
