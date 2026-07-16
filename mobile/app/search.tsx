import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { api } from '../src/lib/api';
import { asArray, asRecord, asString } from '../src/lib/content-helpers';
import { colors, spacing, typography } from '../src/lib/theme';

type SearchItem = { id: string; title: string; type: string };

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);

  const runSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setItems([]);
      return;
    }
    try {
      const { data } = await api.get('/search', { params: { q: value.trim() } });
      setItems(
        asArray(data).map((item, index) => {
          const record = asRecord(item);
          return {
            id: asString(record.id, String(index)),
            title: asString(record.title) || asString(record.name, 'Rezultat'),
            type: asString(record.type, 'content'),
          };
        }),
      );
    } catch {
      setItems([]);
    }
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Pretraga</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={(value) => void runSearch(value)}
            placeholder="Traži vijesti, igrače, stranice..."
          />
        </>
      }
      ListEmptyComponent={<ScreenEmpty message="Unesite pojam za pretragu." icon="search-outline" />}
      renderItem={({ item }) => (
        <Pressable style={styles.card}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.type}>{item.type}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.background,
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  type: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
