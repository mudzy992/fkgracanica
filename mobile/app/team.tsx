import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLoading } from '../src/components/ScreenLoading';
import { RemoteImage } from '../src/components/RemoteImage';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { colors, spacing, typography } from '../src/lib/theme';

type PlayerItem = { id: string; name: string; position: string; imagePath?: string };

export default function TeamScreen() {
  const router = useRouter();
  const [clubName, setClubName] = useState('FK Gračanica');
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
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
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;

  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.title}>{clubName}</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/player/${item.id}`)}>
          <RemoteImage path={item.imagePath} style={styles.image} />
          <View style={styles.texts}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.position}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  image: { width: 84, height: 84 },
  texts: { flex: 1 },
  name: { ...typography.heading, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
