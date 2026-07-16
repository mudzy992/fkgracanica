import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { QrCodeView } from './QrCodeView';
import { useTheme } from '../lib/theme-context';
import { spacing } from '../lib/theme';

type Props = { value: string | null; onClose: () => void };

export function QrModal({ value, onClose }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Modal visible={!!value} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.card, { backgroundColor: colors.white }]}>
          {value ? <QrCodeView value={value} size={260} /> : null}
          <Pressable
            style={[styles.closeBtn, { backgroundColor: colors.primary }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('close')}
          >
            <Text style={[styles.closeText, { color: colors.white }]}>{t('close')}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { borderRadius: 16, padding: spacing.lg, alignItems: 'center' },
  closeBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  closeText: { fontWeight: '600' },
});
