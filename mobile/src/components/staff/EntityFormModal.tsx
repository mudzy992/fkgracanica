import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../primitives/PrimaryButton';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { EntityImageField } from './EntityImageField';
import type { EntityFieldDef } from './entity-crud-types';

type Props = {
  visible: boolean;
  title: string;
  fields: EntityFieldDef[];
  values: Record<string, string>;
  saving?: boolean;
  onChange: (key: string, value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export function EntityFormModal({
  visible,
  title,
  fields,
  values,
  saving,
  onChange,
  onSave,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[typography.heading, { color: colors.text }]}>{title}</Text>
          <ScrollView contentContainerStyle={styles.form}>
            {fields.map((field) => (
              <View key={field.key} style={styles.field}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {t(field.labelKey)}
                  {field.required ? ' *' : ''}
                </Text>
                {field.type === 'image' ? (
                  <EntityImageField value={values[field.key] ?? ''} onChange={(v) => onChange(field.key, v)} />
                ) : field.type === 'choice' && field.choices ? (
                  <View style={styles.choices}>
                    {field.choices.map((choice) => {
                      const value = typeof choice === 'string' ? choice : choice.value;
                      const label = typeof choice === 'string' ? choice : choice.label;
                      const active = values[field.key] === value;
                      return (
                        <Pressable
                          key={value}
                          onPress={() => onChange(field.key, value)}
                          style={[
                            styles.chip,
                            {
                              borderColor: colors.border,
                              backgroundColor: active ? colors.primary : colors.surface,
                            },
                          ]}
                        >
                          <Text style={{ color: active ? colors.white : colors.text, fontSize: 13 }}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    value={values[field.key] ?? ''}
                    onChangeText={(v) => onChange(field.key, v)}
                    keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                    multiline={field.type === 'multiline'}
                    style={[
                      styles.input,
                      field.type === 'multiline' && styles.multiline,
                      { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
                    ]}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              </View>
            ))}
          </ScrollView>
          <PrimaryButton label={t('save')} onPress={onSave} loading={saving} />
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={[styles.cancel, { color: colors.textMuted }]}>{t('close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.md, gap: spacing.sm },
  form: { gap: spacing.sm, paddingBottom: spacing.md },
  field: { gap: 4 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  cancel: { textAlign: 'center', paddingVertical: spacing.sm },
});
