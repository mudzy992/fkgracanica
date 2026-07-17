import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomePlayerItem } from './load-home-extras';
import { HomeSectionTitle } from './HomeSectionTitle';

type Props = { players: HomePlayerItem[] };

export function HomeFeaturedPlayers({ players }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (players.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <HomeSectionTitle title={t('featuredPlayers')} compact />
        <Pressable onPress={() => router.push('/team')} accessibilityRole="button">
          <Text style={[styles.seeAll, { color: colors.accent }]}>{t('homeSeeAll')}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {players.map((player) => (
          <Pressable
            key={player.id}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.background, opacity: pressed ? 0.92 : 1 },
            ]}
            onPress={() => router.push(`/player/${player.id}`)}
            accessibilityRole="button"
            accessibilityLabel={player.name}
          >
            {player.photoPath ? (
              <RemoteImage path={player.photoPath} variant="medium" style={styles.photo} />
            ) : (
              <View style={[styles.photoFallback, { backgroundColor: colors.surface }]}>
                <Text style={[styles.fallbackNum, { color: colors.primary }]}>?</Text>
              </View>
            )}
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {player.name}
            </Text>
            <Text style={[styles.pos, { color: colors.textMuted }]} numberOfLines={1}>
              {player.position}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontWeight: '600' },
  row: { gap: spacing.sm, paddingTop: spacing.sm },
  card: {
    width: 132,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  photo: { width: '100%', height: 148, borderRadius: 0 },
  photoFallback: { width: '100%', height: 148, alignItems: 'center', justifyContent: 'center' },
  fallbackNum: { ...typography.title },
  name: { ...typography.caption, fontWeight: '700', paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  pos: { ...typography.caption, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
});
