import QRCode from 'react-native-qrcode-svg';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../lib/theme-context';
import { spacing } from '../lib/theme';

interface Props {
  value: string;
  size?: number;
}

export function QrCodeView({ value, size = 180 }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.white, borderColor: colors.primary },
      ]}
    >
      <QRCode value={value} size={size} backgroundColor={colors.white} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
});
