import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing } from '../../lib/theme';

type Variant = 'default' | 'gallery' | 'sponsors';

type TopGap = 'default' | 'compact' | 'none';

type Props = {
  children: ReactNode;
  variant?: Variant;
  topGap?: TopGap;
};

export function HomeSectionShell({ children, variant = 'default', topGap = 'default' }: Props) {
  const { colors } = useTheme();
  const gapStyle = topGap === 'compact' ? styles.gapCompact : topGap === 'none' ? styles.gapNone : styles.gapDefault;

  if (variant === 'gallery') {
    return (
      <View style={[gapStyle, styles.bandPad, { backgroundColor: colors.background }]}>
        {children}
      </View>
    );
  }

  if (variant === 'sponsors') {
    return (
      <View style={[gapStyle, styles.bandPad, { backgroundColor: colors.background }]}>
        {children}
      </View>
    );
  }

  return <View style={gapStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  gapDefault: { marginTop: spacing.xl },
  gapCompact: { marginTop: spacing.md },
  gapNone: {},
  bandPad: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
