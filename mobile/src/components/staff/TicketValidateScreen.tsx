import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Screen } from '../primitives/Screen';
import { AdmissionResultOverlay } from './AdmissionResultOverlay';
import { isSameLockedQr, playAdmissionFeedback, postAdmissionScan } from './admission-scan';
import { mapTicketValidate, ticketOutcome, type TicketValidateCard } from './map-ticket-validate';
import { getApiErrorMessage } from '../../lib/api-error';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { TicketingConfig } from '../../types/api';

export function TicketValidateScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [qrCode, setQrCode] = useState('');
  const [card, setCard] = useState<TicketValidateCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | undefined>();
  const [manualConfirm, setManualConfirm] = useState(false);
  const [pendingAdmit, setPendingAdmit] = useState(false);
  const busyRef = useRef(false);
  const lockedQr = useRef<string | null>(null);

  useEffect(() => {
    void api
      .get<TicketingConfig>('/ticketing/config')
      .then(({ data }) => setMatchId(data.activeTicketMatch?.id))
      .catch(() => undefined);
  }, []);

  const scan = async (value: string, mode: 'inspect' | 'validate') => {
    if (!value || busyRef.current) return;
    busyRef.current = true;
    if (!(mode === 'validate' && pendingAdmit)) {
      setError(null);
      setCard(null);
      setPendingAdmit(false);
    }
    try {
      const { data } = await postAdmissionScan(mode, value, matchId);
      const next = mapTicketValidate(data);
      setCard(next);
      const outcome = ticketOutcome(next, null);
      playAdmissionFeedback(outcome);
      const needsAdmit = mode === 'inspect' && outcome === 'valid' && next?.kind !== 'membership';
      setPendingAdmit(needsAdmit);
    } catch (err) {
      const message = getApiErrorMessage(err, t('validateFailed'));
      setError(message);
      playAdmissionFeedback(ticketOutcome(null, message));
    } finally {
      busyRef.current = false;
    }
  };

  const handleScan = (value: string) => {
    if (!value || busyRef.current || isSameLockedQr(lockedQr.current, value)) return;
    lockedQr.current = value;
    setQrCode(value);
    void scan(value, manualConfirm ? 'inspect' : 'validate');
  };

  const outcome = ticketOutcome(card, error);
  const kindLabel =
    card?.kind === 'pass' ? t('passKind') : card?.kind === 'membership' ? t('membershipKind') : t('ticketKind');
  const detail = [
    kindLabel,
    card?.category,
    card?.status,
    card?.name,
    card?.matchLabel,
    error,
  ].filter(Boolean).join(' · ');
  const title =
    outcome === 'valid' ? t('admissionValid') : outcome === 'used' ? t('admissionUsed') : t('admissionInvalid');

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>{t('ulaz')}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('scanHoldHint')}</Text>
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {permission?.granted ? (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => handleScan(data)}
            />
            {card || error ? (
              <AdmissionResultOverlay
                outcome={outcome}
                title={title}
                detail={detail}
                hint={t('scanHoldHint')}
                confirmLabel={pendingAdmit ? t('scanConfirmAdmit') : undefined}
                onConfirm={pendingAdmit ? () => void scan(lockedQr.current ?? qrCode, 'validate') : undefined}
              />
            ) : null}
          </View>
        ) : (
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => void requestPermission()}>
            <Text style={[styles.buttonText, { color: colors.white }]}>{t('enableCamera')}</Text>
          </Pressable>
        )}
        <View style={styles.row}>
          <Text style={{ color: colors.text, flex: 1 }}>{t('scanManualConfirm')}</Text>
          <Switch value={manualConfirm} onValueChange={setManualConfirm} />
        </View>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={qrCode}
          onChangeText={setQrCode}
          placeholder={t('qrManualPlaceholder')}
          placeholderTextColor={colors.textMuted}
        />
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => handleScan(qrCode.trim())}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>{t('validateAction')}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title },
  hint: { ...typography.caption, marginBottom: spacing.sm },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  cameraWrap: { height: 280, borderRadius: 12, overflow: 'hidden' },
  camera: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  button: { borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
});
