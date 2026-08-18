import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../primitives/Screen';
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
  const busyRef = useRef(false);

  useEffect(() => {
    void api
      .get<TicketingConfig>('/ticketing/config')
      .then(({ data }) => setMatchId(data.activeTicketMatch?.id))
      .catch(() => undefined);
  }, []);

  const validate = async (value = qrCode) => {
    if (!value || busyRef.current) return;
    busyRef.current = true;
    setError(null);
    setCard(null);
    try {
      const { data } = await api.post('/ticketing/validate', { qrCode: value, matchId });
      setCard(mapTicketValidate(data));
    } catch (err) {
      setError(getApiErrorMessage(err, t('validateFailed')));
    } finally {
      busyRef.current = false;
    }
  };

  const outcome = ticketOutcome(card, error);
  const outcomeColor =
    outcome === 'valid' ? colors.success : outcome === 'used' ? colors.accent : colors.danger;
  const kindLabel =
    card?.kind === 'pass' ? t('passKind') : card?.kind === 'membership' ? t('membershipKind') : t('ticketKind');

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>{t('ulaz')}</Text>
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {permission?.granted ? (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
              setQrCode(data);
              void validate(data);
            }}
          />
        ) : (
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => void requestPermission()}>
            <Text style={[styles.buttonText, { color: colors.white }]}>{t('enableCamera')}</Text>
          </Pressable>
        )}
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={qrCode}
          onChangeText={setQrCode}
          placeholder={t('qrManualPlaceholder')}
          placeholderTextColor={colors.textMuted}
        />
        <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => void validate()}>
          <Text style={[styles.buttonText, { color: colors.white }]}>{t('validateAction')}</Text>
        </Pressable>
        {error ? (
          <View style={[styles.resultCard, { borderColor: outcomeColor, backgroundColor: colors.surface }]}>
            <Text style={[styles.resultTitle, { color: outcomeColor }]}>
              {outcome === 'used' ? t('admissionUsed') : t('admissionInvalid')}
            </Text>
            <Text style={[styles.result, { color: colors.textMuted }]}>{error}</Text>
          </View>
        ) : null}
        {card ? (
          <View style={[styles.resultCard, { borderColor: outcomeColor, backgroundColor: colors.surface }]}>
            <Text style={[styles.resultTitle, { color: outcomeColor }]}>
              {card.kind === 'membership' && card.status !== 'ACTIVE' ? t('admissionInvalid') : t('admissionValid')}
            </Text>
            <Text style={[styles.result, { color: colors.textMuted }]}>
              {kindLabel}
              {card.category ? ` · ${card.category}` : ''}
              {card.status ? ` · ${card.status}` : ''}
              {card.name ? ` · ${card.name}` : ''}
            </Text>
            {card.matchLabel ? <Text style={[styles.result, { color: colors.textMuted }]}>{card.matchLabel}</Text> : null}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  camera: { height: 260, borderRadius: 12, overflow: 'hidden' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  button: { borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  result: { ...typography.caption },
  resultTitle: { ...typography.heading },
  resultCard: { borderRadius: 10, borderWidth: 1, padding: spacing.md, gap: spacing.xs },
});
