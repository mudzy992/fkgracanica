import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { Screen } from '../../src/components/primitives/Screen';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { stripHtml } from '../../src/lib/html-text';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

type SectionCard = {
  id: string;
  type: string;
  title: string;
  body: string;
  known: boolean;
};

const KNOWN = new Set(['hero', 'text', 'html', 'generic']);

function pickBody(config: Record<string, unknown>, item: Record<string, unknown>): string {
  return (
    asString(config.body) ||
    asString(config.content) ||
    asString(config.html) ||
    asString(item.body) ||
    asString(item.content)
  );
}

function parseSection(raw: unknown, index: number): SectionCard {
  const item = asRecord(raw);
  const config = asRecord(item.config);
  const type = asString(item.widgetType, 'section');
  const known = KNOWN.has(type);
  const title = asString(config.title) || asString(item.title);
  const body = pickBody(config, item);
  if (known) {
    return {
      id: asString(item.id, String(index)),
      type,
      title,
      body: stripHtml(body),
      known: true,
    };
  }
  const extras = [asString(config.text), asString(item.text), asString(config.description)]
    .filter(Boolean)
    .join('\n');
  return {
    id: asString(item.id, String(index)),
    type,
    title: title || type,
    body: stripHtml(body || extras),
    known: false,
  };
}

export default function CmsPageScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<SectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      setError(false);
      const { data } = await api.get(`/cms/pages/${slug}`);
      const page = asRecord(data);
      setTitle(asString(page.title, 'CMS'));
      setSections(asArray(page.sections).map(parseSection));
    } catch {
      setSections([]);
      setError(true);
    }
  }, [slug]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenLoading />;
  if (error) {
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

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {sections.map((section) => (
        <View
          key={section.id}
          style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <Text style={[styles.section, { color: colors.text }]}>
            {section.known ? section.title || section.type : section.type}
          </Text>
          {!section.known && section.title && section.title !== section.type ? (
            <Text style={[styles.caption, { color: colors.textMuted }]}>{section.title}</Text>
          ) : null}
          {section.body ? (
            <Text style={[styles.body, { color: colors.text }]}>{section.body}</Text>
          ) : null}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  section: { ...typography.heading },
  caption: { ...typography.caption, marginTop: spacing.xs },
  body: { ...typography.body, marginTop: spacing.sm, lineHeight: 22 },
});
