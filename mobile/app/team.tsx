import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { RemoteImage } from '../src/components/RemoteImage';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

type PlayerItem = { id: string; name: string; position: string; imagePath?: string };

export default function TeamScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [clubName, setClubName] = useState('FK Gračanica');
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get('/clubs/own');
      const club = asRecord(data);
      setClubName(asString(club.name, 'FK Gračanica'));
      const squad = await api.get(`/clubs/${asString(club.id)}/squad`);
      setPlayers(
        asArray(squad.data).map((entry, index) => {
          const item = asRecord(entry);
          const player = asRecord(item.player);
          return {
            id: asString(player.id, String(index)),
            name: [asString(player.firstName), asString(player.lastName)].filter(Boolean).join(' ') || asString(player.name, 'Igrač'),
            position: asString(player.position, 'Tim'),
            imagePath: asString(player.imagePath) || asString(player.photoPath),
          };
        }),
      );
    } catch {
      setPlayers([]);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ListSkeleton />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void load().finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={[styles.title, { color: colors.text }]}>{clubName}</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => router.push(`/player/${item.id}`)}
          accessibilityRole="button"
          accessibilityLabel={item.name}
        >
          <RemoteImage path={item.imagePath} style={styles.image} />
          <View style={styles.texts}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.position}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  image: { width: 84, height: 84 },
  texts: { flex: 1 },
  name: { ...typography.heading },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
