import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenLoading } from '../src/components/ScreenLoading';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { colors, spacing, typography } from '../src/lib/theme';

type Block = { title: string; items: string[] };

export default function HeritageScreen() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [sponsors, trophies, timeline, hall, museum] = await Promise.all([
        api.get('/sponsors'),
        api.get('/trophies'),
        api.get('/club-timeline'),
        api.get('/hall-of-fame'),
        api.get('/museum'),
      ]);
      setBlocks([
        { title: 'Sponzori', items: asArray(sponsors.data).map((x) => asString(asRecord(x).name, 'Sponzor')) },
        { title: 'Trofeji', items: asArray(trophies.data).map((x) => asString(asRecord(x).title, 'Trofej')) },
        { title: 'Timeline', items: asArray(timeline.data).map((x) => asString(asRecord(x).title, 'Događaj')) },
        { title: 'Hall of Fame', items: asArray(hall.data).map((x) => asString(asRecord(x).name, 'Član')) },
        { title: 'Muzej', items: asArray(museum.data).map((x) => asString(asRecord(x).title, 'Artefakt')) },
      ]);
    } catch {
      setBlocks([]);
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Klupska baština</Text>
      {blocks.map((block) => (
        <View key={block.title} style={styles.card}>
          <Text style={styles.section}>{block.title}</Text>
          {block.items.slice(0, 6).map((item) => (
            <Text key={`${block.title}-${item}`} style={styles.item}>
              • {item}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  section: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  item: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
});
