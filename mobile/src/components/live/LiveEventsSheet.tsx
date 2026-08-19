import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LiveEventList } from '../LiveEventList';
import { spacing, typography } from '../../lib/theme';
import { useTheme } from '../../lib/theme-context';
import type { MatchEvent } from '../../types/api';

type Props = {
  visible: boolean;
  events: MatchEvent[];
  connected: boolean;
  onClose: () => void;
};

export function LiveEventsSheet({ visible, events, connected, onClose }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[typography.heading, { color: colors.text }]}>{t('matchEventsCta')}</Text>
          <ScrollView style={styles.list}>
            <LiveEventList events={events} connected={connected} />
          </ScrollView>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('close')}>
            <Text style={[styles.close, { color: colors.textMuted }]}>{t('close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '72%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  list: { maxHeight: 420 },
  close: { textAlign: 'center', paddingVertical: spacing.sm, fontWeight: '600' },
});
