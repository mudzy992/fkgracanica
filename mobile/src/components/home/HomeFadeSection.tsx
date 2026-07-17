import { useEffect, useRef, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';

type Props = { children: ReactNode; delay?: number };

export function HomeFadeSection({ children, delay = 0 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        opacity.setValue(1);
        return;
      }
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [delay, opacity]);

  return <Animated.View style={[styles.wrap, { opacity }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  wrap: {},
});
