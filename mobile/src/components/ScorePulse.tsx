import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { spacing } from '../lib/theme';

type Props = { homeScore: number; awayScore: number; color: string };

export function ScorePulse({ homeScore, awayScore, color }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(`${homeScore}:${awayScore}`);

  useEffect(() => {
    const next = `${homeScore}:${awayScore}`;
    if (prev.current === next) return;
    prev.current = next;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 140, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [homeScore, awayScore, scale]);

  return (
    <Animated.Text style={[styles.score, { color, transform: [{ scale }] }]}>
      {homeScore} : {awayScore}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  score: { fontSize: 32, fontWeight: '700', paddingHorizontal: spacing.md },
});
