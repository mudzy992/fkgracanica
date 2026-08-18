import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { LatestAndroidRelease, UpdatePhase } from './apk-update';

type Props = {
  release: LatestAndroidRelease | null;
  force: boolean;
  phase: UpdatePhase;
  progress: number;
  error: string | null;
  onUpdate: () => void;
  onLater: () => void;
};

export function ApkUpdateModal({ release, force, phase, progress, error, onUpdate, onLater }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (!release) return null;
  const busy = phase !== 'idle';
  const percent = Math.round(progress * 100);
  const phaseLabel =
    phase === 'download'
      ? t('appUpdateDownloading', { percent })
      : phase === 'verify'
        ? t('appUpdateVerifying')
        : phase === 'install'
          ? t('appUpdateInstalling')
          : null;

  return (
    <Modal
      visible
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (!force && !busy) onLater();
      }}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {force ? t('appUpdateForceTitle') : t('appUpdateTitle')}
          </Text>
          <Text style={{ color: colors.textMuted }}>{t('appUpdateAvailable', { version: release.version })}</Text>
          {release.releaseNotes ? (
            <Text style={[styles.notes, { color: colors.textMuted }]}>{release.releaseNotes}</Text>
          ) : null}
          {phaseLabel ? (
            <Text style={{ color: colors.primary, marginTop: spacing.sm }}>{phaseLabel}</Text>
          ) : null}
          {busy ? (
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View style={[styles.fill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
            </View>
          ) : null}
          {error ? <Text style={{ color: colors.danger, marginTop: spacing.sm }}>{error}</Text> : null}
          <Pressable
            style={[styles.btn, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}
            onPress={onUpdate}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={[styles.btnText, { color: colors.white }]}>
              {busy ? t('appUpdateWorking') : t('appUpdateNow')}
            </Text>
          </Pressable>
          {!force && !busy ? (
            <Pressable onPress={onLater} accessibilityRole="button" style={styles.later}>
              <Text style={{ color: colors.textMuted }}>{t('appUpdateLater')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.65)' },
  card: { padding: spacing.lg, borderRadius: 16, borderWidth: 1 },
  title: { ...typography.heading, marginBottom: spacing.sm },
  notes: { marginTop: spacing.sm, ...typography.caption },
  btn: { marginTop: spacing.md, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  btnText: { fontWeight: '700' },
  later: { marginTop: spacing.sm, alignItems: 'center', paddingVertical: spacing.sm },
  track: { height: 6, borderRadius: 3, marginTop: spacing.sm, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
