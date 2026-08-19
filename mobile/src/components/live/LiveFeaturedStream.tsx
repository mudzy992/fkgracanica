import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Match } from '../../types/api';
import { parseYouTubeId } from '../../lib/youtube-id';
import { LiveStreamPaused } from './LiveStreamPaused';
import { LiveStreamPlayer } from './LiveStreamPlayer';

type Props = { match: Match | undefined; onOpen: (id: string) => void };

export function LiveFeaturedStream({ match, onOpen }: Props) {
  const { t } = useTranslation();
  if (!match) return null;
  const url = match.liveStreamUrl ?? match.youtubeUrl;
  if (!url || !parseYouTubeId(url)) return null;
  if (match.status !== 'LIVE' && match.status !== 'HALFTIME') return null;
  return (
    <View style={styles.wrap}>
      {match.status === 'HALFTIME' ? (
        <LiveStreamPaused match={match} variant="strip" />
      ) : (
        <LiveStreamPlayer url={url} variant="strip" />
      )}
      <Pressable
        style={styles.hit}
        onPress={() => onOpen(match.id)}
        accessibilityRole="button"
        accessibilityLabel={t('matchOpenBroadcast')}
      >
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{t('matchOpenBroadcast')}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: '#000' },
  hit: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  cta: {
    alignSelf: 'flex-end',
    margin: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ctaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
