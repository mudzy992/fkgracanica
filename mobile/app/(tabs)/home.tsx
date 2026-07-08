import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RemoteImage } from '../../src/components/RemoteImage';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth';
import { formatDateTimeBs } from '../../src/lib/format-date';
import { colors, spacing, typography } from '../../src/lib/theme';
import type { Match, NewsItem } from '../../src/types/api';

function pickFeaturedMatch(matches: Match[]): Match | null {
  const live = matches
    .filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  if (live[0]) return live[0];

  const now = Date.now();
  const upcoming = matches
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return upcoming[0] ?? null;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [newsRes, matchesRes] = await Promise.all([
        api.get<NewsItem[]>('/news/published'),
        api.get<Match[]>('/matches'),
      ]);
      setNews(newsRes.data.slice(0, 3));
      setNextMatch(pickFeaturedMatch(matchesRes.data));
    } catch {
      setNews([]);
      setNextMatch(null);
    }
  }, []);

  useEffect(() => {
    void loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) return <ScreenLoading />;

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
    >
      <Text style={styles.welcome}>
        {t('welcome')}, {displayName}
      </Text>

      <Text style={styles.sectionTitle}>{t('nextMatch')}</Text>
      {nextMatch ? (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/(tabs)/live/${nextMatch.id}`)}
        >
          <Text style={styles.matchTeams}>
            {nextMatch.homeClub.name} {t('vs')} {nextMatch.awayClub.name}
          </Text>
          <Text style={styles.meta}>{formatDateTimeBs(nextMatch.scheduledAt)}</Text>
          {nextMatch.venue ? <Text style={styles.meta}>{nextMatch.venue}</Text> : null}
          <Text style={styles.link}>{t('followLive')}</Text>
        </Pressable>
      ) : (
        <ScreenEmpty message="—" icon="football-outline" compact />
      )}

      <Text style={styles.sectionTitle}>{t('latestNews')}</Text>
      {news.length === 0 ? (
        <ScreenEmpty message={t('noNews')} icon="newspaper-outline" compact />
      ) : (
        news.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/(tabs)/news/${item.slug}`)}
          >
            {item.coverPath ? (
              <RemoteImage path={item.coverPath} style={styles.thumb} />
            ) : null}
            <Text style={styles.newsTitle}>{item.title}</Text>
            {item.excerpt ? (
              <Text style={styles.excerpt} numberOfLines={2}>{item.excerpt}</Text>
            ) : null}
            <Text style={styles.link}>{t('readMore')}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, gap: spacing.sm },
  welcome: { ...typography.heading, color: colors.primary, marginBottom: spacing.md },
  sectionTitle: { ...typography.heading, color: colors.text, marginTop: spacing.md },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  thumb: { height: 100, marginBottom: spacing.sm },
  matchTeams: { ...typography.heading, color: colors.text },
  newsTitle: { ...typography.heading, color: colors.text },
  excerpt: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  link: { color: colors.accent, marginTop: spacing.sm, fontWeight: '600' },
});
