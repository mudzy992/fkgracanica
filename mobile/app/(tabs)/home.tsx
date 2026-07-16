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
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { RemoteImage } from '../../src/components/RemoteImage';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth';
import { formatDateTimeBs } from '../../src/lib/format-date';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';
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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [newsRes, matchesRes] = await Promise.all([
        api.get<NewsItem[]>('/news/published'),
        api.get<Match[]>('/matches'),
      ]);
      setNews(newsRes.data.slice(0, 3));
      setNextMatch(pickFeaturedMatch(matchesRes.data));
    } catch {
      setNews([]);
      setNextMatch(null);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void loadData().finally(() => setLoading(false));
  }, [loadData]);

  if (loading) return <ListSkeleton rows={3} />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void loadData().finally(() => setLoading(false));
        }}
      />
    );
  }

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadData().finally(() => setRefreshing(false));
          }}
        />
      }
    >
      <Text style={[styles.welcome, { color: colors.primary }]}>
        {t('welcome')}, {displayName}
      </Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('nextMatch')}</Text>
      {nextMatch ? (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => router.push(`/(tabs)/live/${nextMatch.id}`)}
          accessibilityRole="button"
        >
          <Text style={[styles.matchTeams, { color: colors.text }]}>
            {nextMatch.homeClub.name} {t('vs')} {nextMatch.awayClub.name}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{formatDateTimeBs(nextMatch.scheduledAt)}</Text>
          {nextMatch.venue ? <Text style={[styles.meta, { color: colors.textMuted }]}>{nextMatch.venue}</Text> : null}
          <Text style={[styles.link, { color: colors.accent }]}>{t('followLive')}</Text>
        </Pressable>
      ) : (
        <ScreenEmpty message="—" icon="football-outline" compact />
      )}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('latestNews')}</Text>
      {news.length === 0 ? (
        <ScreenEmpty message={t('noNews')} icon="newspaper-outline" compact />
      ) : (
        news.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => router.push(`/(tabs)/news/${item.slug}`)}
            accessibilityRole="button"
          >
            {item.coverPath ? <RemoteImage path={item.coverPath} style={styles.thumb} /> : null}
            <Text style={[styles.newsTitle, { color: colors.text }]}>{item.title}</Text>
            {item.excerpt ? (
              <Text style={[styles.excerpt, { color: colors.textMuted }]} numberOfLines={2}>{item.excerpt}</Text>
            ) : null}
            <Text style={[styles.link, { color: colors.accent }]}>{t('readMore')}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm },
  welcome: { ...typography.heading, marginBottom: spacing.md },
  sectionTitle: { ...typography.heading, marginTop: spacing.md },
  card: { borderRadius: 10, padding: spacing.md, borderWidth: 1, marginTop: spacing.sm },
  thumb: { height: 100, marginBottom: spacing.sm },
  matchTeams: { ...typography.heading },
  newsTitle: { ...typography.heading },
  excerpt: { ...typography.body, marginTop: spacing.xs },
  meta: { ...typography.caption, marginTop: spacing.xs },
  link: { marginTop: spacing.sm, fontWeight: '600' },
});
