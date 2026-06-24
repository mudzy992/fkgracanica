import { Image, type ImageStyle, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

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
  const uri = mediaUrl(path);
  if (!uri) {
    return <View style={[styles.placeholder, containerStyle, style]} />;
  }
  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 180, borderRadius: 8, backgroundColor: colors.surface },
  placeholder: { width: '100%', height: 180, borderRadius: 8, backgroundColor: colors.surface },
});
