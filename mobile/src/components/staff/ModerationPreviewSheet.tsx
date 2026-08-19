import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RemoteImage } from '../RemoteImage';
import { PrimaryButton } from '../primitives/PrimaryButton';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

export type QueueItem = {
  id: string;
  title: string;
  excerpt?: string;
  coverPath?: string | null;
  status?: string;
};

type Props = {
  item: QueueItem | null;
  onClose: () => void;
  onApprove: () => void;
  onReject?: () => void;
};

export function ModerationPreviewSheet({ item, onClose, onApprove, onReject }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (!item) return null;
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView
          style={[styles.sheet, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[typography.heading, { color: colors.text }]}>{item.title}</Text>
          {item.coverPath ? <RemoteImage path={item.coverPath} variant="medium" style={styles.cover} /> : null}
          {item.excerpt ? <Text style={[typography.body, { color: colors.textMuted }]}>{item.excerpt}</Text> : null}
          {item.status ? <Text style={[typography.caption, { color: colors.textMuted }]}>{item.status}</Text> : null}
          <PrimaryButton label={t('approve')} onPress={onApprove} />
          {onReject ? <PrimaryButton label={t('reject')} onPress={onReject} /> : null}
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={[styles.close, { color: colors.textMuted }]}>{t('close')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '75%' },
  sheetContent: { padding: spacing.md, gap: spacing.sm },
  cover: { width: '100%', height: 160, borderRadius: 10 },
  close: { textAlign: 'center', paddingVertical: spacing.sm },
});
