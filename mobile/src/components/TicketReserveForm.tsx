import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from './primitives/PrimaryButton';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { MatchAvailability, TicketCategory } from '../types/api';

type Props = {
  categories: TicketCategory[];
  availability: MatchAvailability | null;
  categoryId: string | null;
  quantity: string;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onSelectCategory: (id: string) => void;
  onChangeQuantity: (value: string) => void;
  onReserve: () => void;
};

export function TicketReserveForm({
  categories,
  availability,
  categoryId,
  quantity,
  submitting,
  error,
  onBack,
  onSelectCategory,
  onChangeQuantity,
  onReserve,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.form}>
      <Pressable onPress={onBack} accessibilityRole="button">
        <Text style={[styles.back, { color: colors.accent }]}>{t('matches')}</Text>
      </Pressable>
      {availability ? (
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {t('available')}: {availability.remaining} / {availability.capacity}
        </Text>
      ) : null}
      <Text style={[styles.label, { color: colors.text }]}>{t('category')}</Text>
      <View style={styles.chips}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.background },
              categoryId === c.id && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => onSelectCategory(c.id)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.text },
                categoryId === c.id && { color: colors.white, fontWeight: '600' },
              ]}
            >
              {c.label} · {c.price} KM
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{t('quantity')}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        value={quantity}
        onChangeText={onChangeQuantity}
        keyboardType="number-pad"
        accessibilityLabel={t('quantity')}
      />
      {error ? <Text style={[styles.err, { color: colors.danger }]}>{error}</Text> : null}
      <PrimaryButton label={t('reserveTicket')} loading={submitting} onPress={onReserve} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.md, gap: spacing.sm },
  meta: { ...typography.caption, marginTop: spacing.xs },
  back: { ...typography.body, fontWeight: '600', marginBottom: spacing.sm },
  label: { ...typography.caption, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 16, borderWidth: 1 },
  chipText: { ...typography.caption },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  err: { ...typography.caption, marginVertical: spacing.xs },
});
