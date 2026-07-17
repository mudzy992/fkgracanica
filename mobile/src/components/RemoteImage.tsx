import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageContentFit } from 'expo-image';
import { type ImageStyle, StyleSheet, View, type ViewStyle } from 'react-native';
import { mediaUrl, type MediaVariant } from '../lib/media';
import { useTheme } from '../lib/theme-context';

interface Props {
  path?: string | null;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  variant?: MediaVariant;
  contentFit?: ImageContentFit;
}

export function RemoteImage({ path, style, containerStyle, variant, contentFit = 'cover' }: Props) {
  const { colors } = useTheme();
  const uri = mediaUrl(path, variant);
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
      contentFit={contentFit}
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
