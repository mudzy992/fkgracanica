import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

type Block = { title: string; items: string[] };

export default function HeritageScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [sponsors, trophies, timeline, hall, museum] = await Promise.all([
        api.get('/sponsors'),
        api.get('/trophies'),
        api.get('/club-timeline'),
        api.get('/hall-of-fame'),
        api.get('/museum'),
      ]);
      setBlocks([
        { title: t('sponsors'), items: asArray(sponsors.data).map((x) => asString(asRecord(x).name, '—')) },
        {
          title: t('trophies'),
          items: asArray(trophies.data).map((x) => asString(asRecord(x).name) || asString(asRecord(x).title, '—')),
        },
        { title: t('timeline'), items: asArray(timeline.data).map((x) => asString(asRecord(x).title, '—')) },
        { title: t('hallOfFame'), items: asArray(hall.data).map((x) => asString(asRecord(x).name, '—')) },
        { title: t('museum'), items: asArray(museum.data).map((x) => asString(asRecord(x).title, '—')) },
      ]);
    } catch {
      setBlocks([]);
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
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('heritage')}</Text>
      {blocks.map((block) => (
        <View key={block.title} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.section, { color: colors.text }]}>{block.title}</Text>
          {block.items.map((item, index) => (
            <Text key={`${block.title}-${index}`} style={[styles.item, { color: colors.textMuted }]}>
              • {item}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md },
  section: { ...typography.heading, marginBottom: spacing.sm },
  item: { ...typography.body, marginBottom: spacing.xs },
});
