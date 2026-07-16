import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../primitives/PrimaryButton';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type NewsCategory = { id: string; name: string };

type Props = {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string | null;
  coverPath: string | null;
  categories: NewsCategory[];
  saving: boolean;
  isEdit: boolean;
  onChangeTitle: (v: string) => void;
  onChangeExcerpt: (v: string) => void;
  onChangeContent: (v: string) => void;
  onChangeCategory: (id: string) => void;
  onPickCover: () => void;
  onSave: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function WriterForm(props: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const inputStyle = [
    styles.input,
    { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <TextInput
        style={inputStyle}
        value={props.title}
        onChangeText={props.onChangeTitle}
        placeholder={t('writerTitle')}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={inputStyle}
        value={props.excerpt}
        onChangeText={props.onChangeExcerpt}
        placeholder={t('writerExcerpt')}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={[inputStyle, styles.content]}
        value={props.content}
        onChangeText={props.onChangeContent}
        placeholder={t('writerContent')}
        placeholderTextColor={colors.textMuted}
        multiline
      />
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('category')}</Text>
      <View style={styles.chips}>
        {props.categories.map((cat) => {
          const active = props.categoryId === cat.id;
          return (
            <Pressable
              key={cat.id}
              accessibilityRole="button"
              accessibilityLabel={cat.name}
              onPress={() => props.onChangeCategory(cat.id)}
              style={[
                styles.chip,
                {
                  borderColor: colors.border,
                  backgroundColor: active ? colors.primary : colors.surface,
                },
              ]}
            >
              <Text style={{ color: active ? colors.white : colors.text }}>{cat.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton
        label={props.coverPath ? t('writerCoverSet') : t('writerPickCover')}
        onPress={props.onPickCover}
      />
      <PrimaryButton
        label={props.isEdit ? t('writerSave') : t('writerSaveDraft')}
        onPress={props.onSave}
        loading={props.saving}
      />
      {props.isEdit ? (
        <PrimaryButton label={t('writerSubmit')} onPress={props.onSubmit} loading={props.saving} />
      ) : null}
      <Pressable accessibilityRole="button" onPress={props.onCancel}>
        <Text style={[styles.cancel, { color: colors.textMuted }]}>{t('close')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  content: { minHeight: 140, textAlignVertical: 'top', ...typography.body },
  label: { ...typography.caption, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  cancel: { ...typography.body, textAlign: 'center', paddingVertical: spacing.sm },
});
