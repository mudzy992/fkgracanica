import { type ViewStyle } from 'react-native';
import { spacing } from '../../lib/theme';
import type { ColorPalette } from '../../lib/theme';

export const homeRadius = 20;

export function homeSurface(colors: ColorPalette, live = false): ViewStyle {
  return {
    backgroundColor: colors.background,
    borderRadius: homeRadius,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: live ? 0.12 : 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: live ? 3 : 2,
  };
}

export function homeInset(colors: ColorPalette): ViewStyle {
  return {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.sm,
  };
}
