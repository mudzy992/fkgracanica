import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../lib/theme-context';
import { spacing } from '../lib/theme';

type Props = { rows?: number };

export function ListSkeleton({ rows = 4 }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.92, duration: 720, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.42, duration: 720, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const bar = { backgroundColor: colors.border, opacity: pulse };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface }]} accessibilityLabel={t('loading')}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Animated.View style={[styles.media, bar]} />
          <View style={styles.lines}>
            <Animated.View style={[styles.line, styles.wide, bar]} />
            <Animated.View style={[styles.line, styles.mid, bar]} />
            <Animated.View style={[styles.line, styles.narrow, bar]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.md, gap: spacing.md },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  media: { height: 72 },
  lines: { padding: spacing.md, gap: spacing.sm },
  line: { height: 10, borderRadius: 6 },
  wide: { width: '88%' },
  mid: { width: '64%' },
  narrow: { width: '38%' },
});
