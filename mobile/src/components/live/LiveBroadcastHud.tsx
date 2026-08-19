import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatLiveMinute, type LiveClockState } from '../../lib/live-clock';
import type { Match } from '../../types/api';
import { RemoteImage } from '../RemoteImage';

type Props = {
  match: Match;
  clock: LiveClockState | null;
  expanded: boolean;
  onToggle: () => void;
};

export function LiveBroadcastHud({ match, clock, expanded, onToggle }: Props) {
  const { t } = useTranslation();
  const isHalftime = match.status === 'HALFTIME';
  const minute = isHalftime ? t('matchHalftime') : formatLiveMinute(clock, match.minute);
  const crest = expanded ? 36 : 26;
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={t('live')}
      style={[styles.card, expanded && styles.cardWide]}
    >
      <View style={styles.row}>
        <Team name={match.awayClub.name} crest={match.awayClub.crestPath} size={crest} align="left" />
        <View style={styles.mid}>
          <Text style={[styles.score, expanded && styles.scoreLg]}>
            {match.awayScore}
            <Text style={styles.sep}> - </Text>
            {match.homeScore}
          </Text>
          <Text style={styles.min}>{minute}</Text>
          {expanded && clock?.periodLabel && match.status === 'LIVE' ? (
            <Text style={styles.period}>{clock.periodLabel}</Text>
          ) : null}
        </View>
        <Team name={match.homeClub.name} crest={match.homeClub.crestPath} size={crest} align="right" />
      </View>
    </Pressable>
  );
}

function Team({
  name,
  crest,
  size,
  align,
}: {
  name: string;
  crest?: string | null;
  size: number;
  align: 'left' | 'right';
}) {
  return (
    <View style={[styles.team, align === 'right' && styles.teamRight]}>
      {align === 'left' ? <RemoteImage path={crest} variant="thumb" transparent style={{ width: size, height: size }} /> : null}
      <Text style={[styles.name, align === 'right' && styles.nameRight]} numberOfLines={1}>
        {name}
      </Text>
      {align === 'right' ? <RemoteImage path={crest} variant="thumb" transparent style={{ width: size, height: size }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cardWide: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  team: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamRight: { justifyContent: 'flex-end' },
  name: { flex: 1, color: '#fff', fontSize: 12, fontWeight: '700' },
  nameRight: { textAlign: 'right' },
  mid: { alignItems: 'center', paddingHorizontal: 4 },
  score: { color: '#fff', fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  scoreLg: { fontSize: 32 },
  sep: { color: 'rgba(255,255,255,0.45)', fontWeight: '700' },
  min: { color: '#FACC15', fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  period: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 1 },
});
