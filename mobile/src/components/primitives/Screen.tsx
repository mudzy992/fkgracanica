import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing } from '../../lib/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: ViewStyle;
} & Pick<ScrollViewProps, 'refreshControl'>;

export function Screen({ children, scroll, padded = true, contentStyle, refreshControl }: Props) {
  const { colors } = useTheme();

  if (scroll) {
    return (
      <ScrollView
        style={[styles.fill, { backgroundColor: colors.surface }]}
        contentContainerStyle={[padded && styles.content, contentStyle]}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.surface }, padded && styles.content, contentStyle]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm },
});
