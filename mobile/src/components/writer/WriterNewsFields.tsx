import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { PrimaryButton } from '../primitives/PrimaryButton';
import type { WriterArticle, WriterCategory } from './writer-article';

type Props = {
  article: WriterArticle;
  categories: WriterCategory[];
  onChange: (patch: Partial<WriterArticle>) => void;
  onPickCover: () => void;
};

export function WriterNewsFields({ article, categories, onChange, onPickCover }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const input = [styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }];

  return (
    <View style={styles.wrap}>
      <TextInput style={input} value={article.title} onChangeText={(title) => onChange({ title })} placeholder={t('writerTitle')} placeholderTextColor={colors.textMuted} />
      <TextInput style={input} value={article.slug} onChangeText={(slug) => onChange({ slug })} placeholder={t('writerSlug')} placeholderTextColor={colors.textMuted} autoCapitalize="none" />
      <TextInput style={input} value={article.excerpt} onChangeText={(excerpt) => onChange({ excerpt })} placeholder={t('writerExcerpt')} placeholderTextColor={colors.textMuted} />
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('category')}</Text>
      <View style={styles.chips}>
        {categories.map((cat) => {
          const active = article.categoryId === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onChange({ categoryId: cat.id })}
              style={[styles.chip, { borderColor: colors.border, backgroundColor: active ? colors.primary : colors.surface }]}
            >
              <Text style={{ color: active ? colors.white : colors.text }}>{cat.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton label={article.coverPath ? t('writerCoverSet') : t('writerPickCover')} onPress={onPickCover} />
      <TextInput style={input} value={article.videoUrl} onChangeText={(videoUrl) => onChange({ videoUrl })} placeholder={t('writerVideoUrl')} placeholderTextColor={colors.textMuted} autoCapitalize="none" />
      <TextInput style={input} value={article.tagsCsv} onChangeText={(tagsCsv) => onChange({ tagsCsv })} placeholder={t('writerTags')} placeholderTextColor={colors.textMuted} />
      <TextInput style={input} value={article.seoTitle} onChangeText={(seoTitle) => onChange({ seoTitle })} placeholder={t('writerSeoTitle')} placeholderTextColor={colors.textMuted} />
      <TextInput style={[input, styles.multi]} value={article.seoDesc} onChangeText={(seoDesc) => onChange({ seoDesc })} placeholder={t('writerSeoDesc')} placeholderTextColor={colors.textMuted} multiline />
      <TextInput style={input} value={article.scheduledAt} onChangeText={(scheduledAt) => onChange({ scheduledAt })} placeholder={t('writerScheduled')} placeholderTextColor={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  multi: { minHeight: 72, textAlignVertical: 'top' },
  label: { ...typography.caption, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 6 },
});
