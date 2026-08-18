import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../lib/theme';

type Tick = { id: string; label: string };

type Props = {
  items: Tick[];
  activeId?: string;
  onSelect: (id: string) => void;
};

export function HeritageHofRail({ items, activeId, onSelect }: Props) {
  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={styles.row}
          >
            <Text style={[styles.label, active ? styles.labelOn : styles.labelOff]}>{item.label}</Text>
            <View style={[styles.dot, active ? styles.dotOn : undefined]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const GOLD = '#C9A227';

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dotOn: { backgroundColor: GOLD, width: 9, height: 9, borderRadius: 5 },
  label: { ...typography.caption, fontSize: 11, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  labelOn: { color: GOLD },
  labelOff: { color: 'rgba(255,255,255,0.4)' },
});
