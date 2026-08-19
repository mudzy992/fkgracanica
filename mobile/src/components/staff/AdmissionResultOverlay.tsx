import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../lib/theme';
import type { AdmissionOutcome } from './map-ticket-validate';

type Props = {
  outcome: AdmissionOutcome;
  title: string;
  detail: string;
  hint: string;
  confirmLabel?: string;
  onConfirm?: () => void;
};

const BG: Record<AdmissionOutcome, string> = {
  valid: 'rgba(22, 163, 74, 0.92)',
  used: 'rgba(220, 38, 38, 0.92)',
  invalid: 'rgba(185, 28, 28, 0.92)',
};

export function AdmissionResultOverlay({
  outcome,
  title,
  detail,
  hint,
  confirmLabel,
  onConfirm,
}: Props) {
  return (
    <View style={[styles.wrap, { backgroundColor: BG[outcome] }]} pointerEvents="box-none">
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      <Text style={styles.hint}>{hint}</Text>
      {confirmLabel && onConfirm ? (
        <Pressable
          accessibilityRole="button"
          style={styles.confirm}
          onPress={onConfirm}
        >
          <Text style={styles.confirmText}>{confirmLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
  },
  title: { ...typography.title, color: '#fff', textAlign: 'center', fontWeight: '800' },
  detail: { ...typography.body, color: '#fff', textAlign: 'center', marginTop: spacing.sm },
  hint: { ...typography.caption, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: spacing.sm },
  confirm: {
    marginTop: spacing.md,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  confirmText: { fontWeight: '700', color: '#111' },
});
