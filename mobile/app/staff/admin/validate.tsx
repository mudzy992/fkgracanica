import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { Screen } from '../../../src/components/primitives/Screen';
import { colors, spacing, typography } from '../../../src/lib/theme';
import { api } from '../../../src/lib/api';

export default function AdminValidateScreen() {
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
        <Text style={styles.title}>QR validacija</Text>
        <View style={styles.card}>
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
            <Pressable style={styles.button} onPress={() => void requestPermission()}>
              <Text style={styles.buttonText}>Omogući kameru</Text>
            </Pressable>
          )}
          <TextInput style={styles.input} value={qrCode} onChangeText={setQrCode} placeholder="Ili unesite QR kod ručno" />
          <Pressable style={styles.button} onPress={() => void validate()}>
            <Text style={styles.buttonText}>Validiraj</Text>
          </Pressable>
          {result ? <Text style={styles.result}>{result}</Text> : null}
        </View>
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  camera: { height: 260, borderRadius: 12, overflow: 'hidden' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '600' },
  result: { ...typography.caption, color: colors.textMuted },
});
