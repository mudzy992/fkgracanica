import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type WriterNewsItem = {
  id: string;
  title: string;
  status: string;
  excerpt?: string | null;
  content?: string;
  coverPath?: string | null;
  categoryId?: string | null;
};

type Props = {
  items: WriterNewsItem[];
  onSelect: (item: WriterNewsItem) => void;
  onCreate: () => void;
};

export function WriterList({ items, onSelect, onCreate }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('writerCreate')}
        onPress={onCreate}
        style={[styles.createBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.createLabel, { color: colors.white }]}>{t('writerCreate')}</Text>
      </Pressable>
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>{t('writerEmpty')}</Text>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => onSelect(item)}
            style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.status, { color: colors.textMuted }]}>{item.status}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  createBtn: { borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  createLabel: { fontSize: 16, fontWeight: '600' },
  empty: { ...typography.body, textAlign: 'center', paddingVertical: spacing.lg },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: { ...typography.body, fontWeight: '600', flex: 1 },
  status: { ...typography.caption, textTransform: 'uppercase' },
});
