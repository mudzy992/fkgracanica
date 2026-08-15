import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { TeamPlayer } from './load-team-screen';
import { TeamPlayerCard } from './TeamPlayerCard';

type Props = { players: TeamPlayer[] };

export function TeamSpotlight({ players }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  if (players.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {t('teamSpotlight')}
      </Text>
      <View style={styles.grid}>
        {players.map((player) => (
          <TeamPlayerCard
            key={player.id}
            player={player}
            spotlight
            onPress={() => router.push(`/player/${player.id}`)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, gap: spacing.sm },
  title: { ...typography.heading, fontSize: 20, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-start' },
});
