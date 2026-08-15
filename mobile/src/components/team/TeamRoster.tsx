import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { groupTeamPlayers, type TeamPlayer } from './load-team-screen';
import { TeamPlayerCard } from './TeamPlayerCard';

type Props = { players: TeamPlayer[] };

const GROUP_KEYS = {
  GK: 'teamGroupGk',
  DEF: 'teamGroupDef',
  MID: 'teamGroupMid',
  FWD: 'teamGroupFwd',
} as const;

export function TeamRoster({ players }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const bench = players.filter((p) => p.isBench);
  const groups = groupTeamPlayers(players);

  if (players.length === 0) {
    return (
      <Text style={[styles.empty, { color: colors.textMuted }]}>{t('teamEmptyRoster')}</Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {bench.length > 0 ? (
        <Group title={t('teamBench')} players={bench} onPress={(id) => router.push(`/player/${id}`)} />
      ) : null}
      {groups.map((group) => (
        <Group
          key={group.position}
          title={t(GROUP_KEYS[group.position])}
          players={group.players}
          onPress={(id) => router.push(`/player/${id}`)}
        />
      ))}
    </View>
  );
}

function Group({
  title,
  players,
  onPress,
}: {
  title: string;
  players: TeamPlayer[];
  onPress: (id: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.grid}>
        {players.map((player) => (
          <TeamPlayerCard key={player.id} player={player} onPress={() => onPress(player.id)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg, paddingHorizontal: spacing.md },
  group: { gap: spacing.sm },
  title: { ...typography.heading, fontSize: 20, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  empty: { ...typography.body, textAlign: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xl },
});
