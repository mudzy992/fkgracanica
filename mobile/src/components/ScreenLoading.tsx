import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../lib/theme-context';

export function ScreenLoading() {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
