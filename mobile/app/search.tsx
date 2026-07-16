import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { api } from '../src/lib/api';
import { flattenSearchResponse, searchItemHref, type SearchNavItem } from '../src/lib/search-nav';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchNavItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (value: string) => {
    setQuery(value);
    setError(null);
    if (!value.trim()) {
      setItems([]);
      return;
    }
    try {
      const { data } = await api.get('/search', { params: { q: value.trim() } });
      setItems(flattenSearchResponse(data));
    } catch {
      setItems([]);
      setError(t('error'));
    }
  };

  const emptyMessage = !query.trim()
    ? t('searchEmpty')
    : error
      ? error
      : t('searchNoResults');

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          <Text style={[styles.title, { color: colors.text }]}>{t('search')}</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.background, color: colors.text },
            ]}
            value={query}
            onChangeText={(value) => void runSearch(value)}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={t('search')}
          />
        </>
      }
      ListEmptyComponent={
        <ScreenEmpty
          message={emptyMessage}
          icon={error ? 'alert-circle-outline' : 'search-outline'}
          actionLabel={error ? t('retry') : undefined}
          onAction={error ? () => void runSearch(query) : undefined}
        />
      }
      renderItem={({ item }) => {
        const href = searchItemHref(item);
        return (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => {
              if (href) router.push(href as never);
            }}
            disabled={!href}
          >
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.type, { color: colors.textMuted }]}>{item.type}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  title: { ...typography.title, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemTitle: { ...typography.body, fontWeight: '600' },
  type: { ...typography.caption, marginTop: spacing.xs },
});
