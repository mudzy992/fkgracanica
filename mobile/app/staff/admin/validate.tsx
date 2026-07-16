import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { Screen } from '../../../src/components/primitives/Screen';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';
import { api } from '../../../src/lib/api';

export default function AdminValidateScreen() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState('');

  const validate = async (value = qrCode) => {
    if (!value) return;
    const { data } = await api.post('/ticketing/validate', { qrCode: value });
    setResult(JSON.stringify(data));
  };

  return (
    <RequirePermission permission="ticketing.manage" returnTo="/staff/admin/validate">
      <Screen scroll>
        <Text style={[styles.title, { color: colors.text }]}>QR validacija</Text>
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
              <Text style={[styles.buttonText, { color: colors.white }]}>Omogući kameru</Text>
            </Pressable>
          )}
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
            ]}
            value={qrCode}
            onChangeText={setQrCode}
            placeholder="Ili unesite QR kod ručno"
            placeholderTextColor={colors.textMuted}
          />
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => void validate()}>
            <Text style={[styles.buttonText, { color: colors.white }]}>Validiraj</Text>
          </Pressable>
          {result ? <Text style={[styles.result, { color: colors.textMuted }]}>{result}</Text> : null}
        </View>
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  camera: { height: 260, borderRadius: 12, overflow: 'hidden' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  button: { borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  result: { ...typography.caption },
});
