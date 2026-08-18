import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { LiveEventList } from '../../src/components/LiveEventList';
import { LiveScoreboard } from '../../src/components/live/LiveScoreboard';
import { MatchHighlightsList } from '../../src/components/MatchHighlightsList';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { useLiveMatch } from '../../src/hooks/use-live-match';
import { useTheme } from '../../src/lib/theme-context';
import { spacing } from '../../src/lib/theme';

export default function LiveMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { match, connected, loading } = useLiveMatch(id ?? '');

  if (loading && !match) {
    return (
      <>
        <Stack.Screen options={{ title: t('live') }} />
        <ListSkeleton rows={3} />
      </>
    );
  }

  if (!match) {
    return (
      <>
        <Stack.Screen options={{ title: t('live') }} />
        <ScreenEmpty message={t('error')} icon="alert-circle-outline" />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `${match.homeClub.name} – ${match.awayClub.name}` }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.content}
      >
        <LiveScoreboard match={match} />
        <LiveEventList events={match.events ?? []} connected={connected} />
        <MatchHighlightsList
          highlights={match.highlights}
          textColor={colors.text}
          accentColor={colors.primary}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
});
