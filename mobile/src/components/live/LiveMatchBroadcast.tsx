import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnlockOrientation } from '../../hooks/use-unlock-orientation';
import type { LiveClockState } from '../../lib/live-clock';
import type { Match, MatchEvent } from '../../types/api';
import { LiveBroadcastHud } from './LiveBroadcastHud';
import { LiveEventToast } from './LiveEventToast';
import { LiveEventsSheet } from './LiveEventsSheet';
import { LiveStreamPaused } from './LiveStreamPaused';
import { LiveStreamPlayer } from './LiveStreamPlayer';

type Props = {
  match: Match;
  clock: LiveClockState | null;
  toast: MatchEvent | null;
  connected: boolean;
};

export function LiveMatchBroadcast({ match, clock, toast, connected }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const url = match.liveStreamUrl ?? match.youtubeUrl ?? '';
  const isHalftime = match.status === 'HALFTIME';
  const events = [...(match.events ?? [])].reverse();
  useUnlockOrientation();

  return (
    <View style={styles.root}>
      <LiveStreamPlayer url={url} hidden={isHalftime} variant="fill" />
      {isHalftime ? <LiveStreamPaused match={match} variant="fill" /> : null}
      {!isHalftime ? (
        <View pointerEvents="box-none" style={styles.overlay}>
          <View style={[styles.hudWrap, { paddingTop: insets.top + 44 }]}>
            <LiveBroadcastHud
              match={match}
              clock={clock}
              expanded={expanded}
              onToggle={() => setExpanded((v) => !v)}
            />
          </View>
          <LiveEventToast event={toast} bottom={insets.bottom + 56} />
        </View>
      ) : null}
      <Pressable
        onPress={() => setEventsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('matchEventsCta')}
        style={[styles.cta, { bottom: insets.bottom + 16 }]}
      >
        <Text style={styles.ctaText}>{t('matchEventsCta')}</Text>
      </Pressable>
      <LiveEventsSheet
        visible={eventsOpen}
        events={events}
        connected={connected}
        onClose={() => setEventsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  hudWrap: { paddingHorizontal: 10 },
  cta: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
