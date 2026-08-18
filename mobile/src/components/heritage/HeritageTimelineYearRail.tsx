import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../lib/theme';

export type HeritageRailTick = { id: string; label: string; headline?: string };

type Props = {
  items: HeritageRailTick[];
  activeId?: string;
  onSelect: (id: string) => void;
};

export function HeritageTimelineYearRail({ items, activeId, onSelect }: Props) {
  const fade = useRef(new Animated.Value(1)).current;
  const active = items.find((item) => item.id === activeId);
  const headline = active?.headline ?? active?.label;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [headline, fade]);

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <Animated.Text
        style={[
          styles.year,
          {
            opacity: fade,
            transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          },
        ]}
      >
        {headline}
      </Animated.Text>
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
            style={[styles.tick, selected ? styles.tickOn : undefined]}
          >
            <Text style={[styles.tickLabel, selected ? styles.tickLabelOn : styles.tickLabelOff]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 6,
    zIndex: 4,
  },
  year: { ...typography.title, color: '#fff', fontWeight: '800', marginBottom: 4 },
  tick: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, maxWidth: 92 },
  tickOn: { backgroundColor: '#1E3A8A' },
  tickLabel: { ...typography.caption, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  tickLabelOn: { color: '#fff' },
  tickLabelOff: { color: 'rgba(255,255,255,0.45)' },
});
