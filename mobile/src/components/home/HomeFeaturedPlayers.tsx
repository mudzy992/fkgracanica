import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomePlayerItem } from './load-home-extras';
import { HomePlayerCard } from './home-player-card';

type Props = { players: HomePlayerItem[] };

export function HomeFeaturedPlayers({ players }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (players.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {t('featuredPlayers')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('homePlayersSubtitle')}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.seeAllBtn,
            { backgroundColor: colors.background, opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={() => router.push('/team')}
          accessibilityRole="button"
          accessibilityLabel={t('homeOurTeam')}
        >
          <Text style={[styles.seeAll, { color: colors.link }]}>{t('homeOurTeam')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.link} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
        snapToInterval={162}
      >
        {players.map((player) => (
          <HomePlayerCard
            key={player.id}
            player={player}
            onPress={() => router.push(`/player/${player.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerCopy: { flex: 1 },
  title: { ...typography.heading, fontSize: 22, fontWeight: '800' },
  subtitle: { ...typography.caption, marginTop: spacing.xs },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  seeAll: { ...typography.caption, fontWeight: '700' },
  row: { gap: spacing.sm, paddingRight: spacing.md },
});
