import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { LiveEventList } from '../../src/components/LiveEventList';
import { LiveEventToast } from '../../src/components/live/LiveEventToast';
import { LiveScoreboard } from '../../src/components/live/LiveScoreboard';
import { LiveStreamPlayer } from '../../src/components/live/LiveStreamPlayer';
import { MatchHighlightsList } from '../../src/components/MatchHighlightsList';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { useLiveMatch } from '../../src/hooks/use-live-match';
import { useTheme } from '../../src/lib/theme-context';
import { spacing } from '../../src/lib/theme';

export default function LiveMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { match, clock, connected, loading, toast } = useLiveMatch(id ?? '');
  const streamUrl = match?.liveStreamUrl ?? match?.youtubeUrl ?? null;
  const isHalftime = match?.status === 'HALFTIME';

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

  const minuteLabel = isHalftime
    ? t('matchHalftime')
    : clock
      ? `${clock.displayMinute}'`
      : `${match.minute}'`;

  return (
    <>
      <Stack.Screen options={{ title: `${match.homeClub.name} – ${match.awayClub.name}` }} />
      <View style={[styles.root, { backgroundColor: '#050A14' }]}>
        {streamUrl ? <LiveStreamPlayer url={streamUrl} hidden={isHalftime} /> : null}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hud}>
            <Text style={styles.liveBadge}>{isHalftime ? t('matchHalftime') : t('matchLive')}</Text>
            <Text style={styles.clock}>{minuteLabel}</Text>
            {clock?.periodLabel ? <Text style={styles.period}>{clock.periodLabel}</Text> : null}
          </View>
          <LiveScoreboard match={match} />
          <LiveEventList events={[...(match.events ?? [])].reverse()} connected={connected} />
          <MatchHighlightsList
            highlights={match.highlights}
            textColor={colors.text}
            accentColor={colors.primary}
          />
        </ScrollView>
        <LiveEventToast event={toast} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 96 },
  hud: { alignItems: 'center', marginBottom: spacing.md, gap: 4 },
  liveBadge: { color: '#FCA5A5', fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', fontSize: 11 },
  clock: { color: '#FACC15', fontSize: 28, fontWeight: '800' },
  period: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
});
