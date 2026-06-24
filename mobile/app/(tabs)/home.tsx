import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth';
import { colors, spacing, typography } from '../../src/lib/theme';
import type { Match, NewsItem } from '../../src/types/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

      const now = Date.now();
      const upcoming = matchesRes.data
        .filter((m) => new Date(m.scheduledAt).getTime() >= now && m.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      setNextMatch(upcoming[0] ?? null);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          <Text style={styles.meta}>{formatDate(nextMatch.scheduledAt)}</Text>
          {nextMatch.venue ? <Text style={styles.meta}>{nextMatch.venue}</Text> : null}
        </Pressable>
      ) : (
        <Text style={styles.empty}>—</Text>
      )}

      <Text style={styles.sectionTitle}>{t('latestNews')}</Text>
      {news.length === 0 ? (
        <Text style={styles.empty}>{t('noNews')}</Text>
      ) : (
        news.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/(tabs)/news/${item.slug}`)}
          >
            <Text style={styles.newsTitle}>{item.title}</Text>
            {item.excerpt ? <Text style={styles.excerpt} numberOfLines={2}>{item.excerpt}</Text> : null}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  matchTeams: { ...typography.heading, color: colors.text },
  newsTitle: { ...typography.heading, color: colors.text },
  excerpt: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  link: { color: colors.accent, marginTop: spacing.sm, fontWeight: '600' },
  empty: { color: colors.textMuted, marginTop: spacing.sm },
});
