import QRCode from 'react-native-qrcode-svg';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../lib/theme';

interface Props {
  value: string;
  size?: number;
}

export function QrCodeView({ value, size = 180 }: Props) {
  return (
    <View style={styles.wrap}>
      <QRCode value={value} size={size} backgroundColor={colors.white} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
});
