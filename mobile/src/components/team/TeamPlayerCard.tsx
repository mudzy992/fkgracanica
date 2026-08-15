import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { RemoteImage } from '../RemoteImage';
import { POSITION_LABELS, type TeamPlayer } from './load-team-screen';

type Props = {
  player: TeamPlayer;
  onPress: () => void;
  spotlight?: boolean;
};

export function TeamPlayerCard({ player, onPress, spotlight }: Props) {
  const { colors } = useTheme();
  const label = `${player.firstName} ${player.lastName}`.trim();
  const pos = POSITION_LABELS[player.position] ?? player.position;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, spotlight && styles.spotlight, { opacity: pressed ? 0.94 : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {player.photoPath ? (
        <RemoteImage path={player.photoPath} variant="medium" contentFit="cover" style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.fallback, { backgroundColor: colors.surface }]}>
          <Text style={[styles.fallbackNum, { color: colors.link }]}>{player.number ?? '?'}</Text>
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(5, 10, 20, 0.25)', 'rgba(5, 10, 20, 0.95)']}
        locations={[0.2, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.posPill, { backgroundColor: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.15)' }]}>
        <Text style={styles.posText}>{pos}</Text>
      </View>
      {player.goals > 0 ? (
        <View style={[styles.goalsBadge, { backgroundColor: `${colors.primary}33`, borderColor: `${colors.primary}55` }]}>
          <Text style={[styles.goalsText, { color: colors.link }]}>
            {player.goals} {player.goals === 1 ? 'gol' : 'gola'}
          </Text>
        </View>
      ) : null}
      <View style={styles.footer}>
        {player.number != null ? (
          <Text style={[styles.number, { color: colors.link }]}>{player.number}</Text>
        ) : null}
        <Text style={[styles.name, { color: colors.white }]} numberOfLines={2}>
          {player.firstName}
          {player.lastName ? `\n${player.lastName}` : ''}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {player.appearances} utakmica
          {player.assists > 0 ? ` · ${player.assists} asist.` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0A1525',
  },
  spotlight: { width: '31%', minWidth: 108 },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '100%', borderRadius: 0 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackNum: { fontSize: 40, fontWeight: '800' },
  posPill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 2,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  posText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  goalsBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 2,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  goalsText: { fontSize: 10, fontWeight: '800' },
  footer: { flex: 1, justifyContent: 'flex-end', padding: spacing.sm + 2 },
  number: { fontSize: 26, fontWeight: '800', opacity: 0.9 },
  name: { ...typography.heading, fontWeight: '800', textTransform: 'uppercase', lineHeight: 18, fontSize: 13 },
  meta: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 4,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});
