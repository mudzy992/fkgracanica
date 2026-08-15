import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomePlayerItem } from './load-home-extras';

type Props = {
  player: HomePlayerItem;
  onPress: () => void;
};

export function HomePlayerCard({ player, onPress }: Props) {
  const { colors } = useTheme();
  const label = `${player.firstName} ${player.lastName}`.trim();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.94 : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {player.photoPath ? (
        <RemoteImage
          path={player.photoPath}
          variant="medium"
          contentFit="cover"
          style={styles.photo}
        />
      ) : (
        <View style={[styles.photo, styles.fallback, { backgroundColor: colors.surface }]}>
          <Text style={[styles.fallbackNum, { color: colors.link }]}>
            {player.number ?? '?'}
          </Text>
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(5, 10, 20, 0.9)']}
        locations={[0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.goalsBadge, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
        <Text style={[styles.goalsValue, { color: colors.white }]}>{player.goals}</Text>
        <Text style={[styles.goalsLabel, { color: 'rgba(255,255,255,0.55)' }]}>G</Text>
      </View>
      <View style={styles.footer}>
        {player.number ? (
          <Text style={[styles.number, { color: colors.link }]}>{player.number}</Text>
        ) : null}
        <Text style={[styles.name, { color: colors.white }]} numberOfLines={2}>
          {player.firstName}
          {player.lastName ? `\n${player.lastName}` : ''}
        </Text>
        <Text style={[styles.position, { color: 'rgba(255,255,255,0.6)' }]} numberOfLines={1}>
          {player.position}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '100%', borderRadius: 0 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackNum: { fontSize: 44, fontWeight: '800' },
  goalsBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goalsValue: { fontSize: 13, fontWeight: '800' },
  goalsLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  footer: { flex: 1, justifyContent: 'flex-end', padding: spacing.sm + 2 },
  number: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, opacity: 0.85 },
  name: {
    ...typography.heading,
    fontWeight: '800',
    textTransform: 'uppercase',
    lineHeight: 20,
  },
  position: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
