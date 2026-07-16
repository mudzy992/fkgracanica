import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { type ImageStyle, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../lib/theme-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

interface Props {
  path?: string | null;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

export function RemoteImage({ path, style, containerStyle }: Props) {
  const { colors } = useTheme();
  const uri = mediaUrl(path);
  const base = { backgroundColor: colors.surface };
  if (!uri) {
    return (
      <View style={[styles.placeholder, base, containerStyle, style]}>
        <Ionicons name="image-outline" size={28} color={colors.textMuted} />
      </View>
    );
  }
  return (
    <Image
      source={uri}
      style={[styles.image, base, style]}
      contentFit="cover"
      transition={120}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 180, borderRadius: 8 },
  placeholder: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
