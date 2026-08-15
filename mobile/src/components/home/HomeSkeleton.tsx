import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { spacing } from '../../lib/theme';

export function HomeSkeleton() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [pulse]);

  const bone = { backgroundColor: colors.border, opacity: pulse };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface }]} accessibilityLabel="loading">
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <Animated.View style={[styles.heroBackdrop, bone]} />
        <View style={styles.heroCopy}>
          <Animated.View style={[styles.crest, bone]} />
          <Animated.View style={[styles.line, styles.heroTitle, bone]} />
          <Animated.View style={[styles.line, styles.heroSub, bone]} />
          <View style={styles.ctaRow}>
            <Animated.View style={[styles.cta, bone]} />
            <Animated.View style={[styles.cta, bone]} />
          </View>
        </View>
      </View>

      <View style={styles.padded}>
        <Animated.View style={[styles.line, styles.sectionTitle, bone]} />
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.matchRow}>
            <Animated.View style={[styles.teamCircle, bone]} />
            <Animated.View style={[styles.line, styles.score, bone]} />
            <Animated.View style={[styles.teamCircle, bone]} />
          </View>
          <Animated.View style={[styles.line, styles.matchMeta, bone]} />
          <Animated.View style={[styles.ctaBar, bone]} />
        </View>

        <Animated.View style={[styles.line, styles.sectionTitle, bone]} />
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Animated.View style={[styles.newsImage, bone]} />
          <Animated.View style={[styles.line, styles.newsTitle, bone]} />
          <Animated.View style={[styles.line, styles.newsMeta, bone]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  hero: { minHeight: 330, justifyContent: 'flex-end' },
  heroBackdrop: { ...StyleSheet.absoluteFill },
  heroCopy: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  crest: { width: 64, height: 64, borderRadius: 18 },
  line: { borderRadius: 8 },
  heroTitle: { width: '68%', height: 30 },
  heroSub: { width: '48%', height: 14 },
  ctaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cta: { flex: 1, height: 46, borderRadius: 14 },
  padded: { paddingHorizontal: spacing.md, marginTop: spacing.md },
  sectionTitle: { width: '42%', height: 18, marginBottom: spacing.sm },
  card: { borderRadius: 20, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamCircle: { width: 60, height: 60, borderRadius: 18 },
  score: { width: 70, height: 26 },
  matchMeta: { width: '55%', height: 12, alignSelf: 'center' },
  ctaBar: { height: 44, borderRadius: 14 },
  newsImage: { width: '100%', height: 150, borderRadius: 14 },
  newsTitle: { width: '82%', height: 16 },
  newsMeta: { width: '38%', height: 12 },
});
