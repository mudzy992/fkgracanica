import { StyleSheet } from 'react-native';
import { spacing, typography } from '../../lib/theme';

export const commentatorStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: { ...typography.heading },
  hint: { ...typography.caption },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 10, borderWidth: 1 },
  chipText: { ...typography.caption, fontWeight: '600' },
  actionBtn: { borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  actionText: { fontWeight: '600', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  submit: { borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  submitText: { fontWeight: '600' },
});
