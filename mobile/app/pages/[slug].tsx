import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { Screen } from '../../src/components/primitives/Screen';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { colors, spacing, typography } from '../../src/lib/theme';

export default function CmsPageScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      const { data } = await api.get(`/cms/pages/${slug}`);
      const page = asRecord(data);
      setTitle(asString(page.title, 'CMS stranica'));
      setSections(
        asArray(page.sections).map((section) => {
          const item = asRecord(section);
          return asString(item.widgetType, 'section');
        }),
      );
    } catch {
      setSections([]);
    }
  }, [slug]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;

  return (
    <Screen scroll>
      <Text style={styles.title}>{title}</Text>
      {sections.map((section, index) => (
        <View key={`${section}-${index}`} style={styles.card}>
          <Text style={styles.section}>{section}</Text>
          <Text style={styles.caption}>Widget konfiguracija ostaje canonical na web CMS-u.</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  section: { ...typography.heading, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
