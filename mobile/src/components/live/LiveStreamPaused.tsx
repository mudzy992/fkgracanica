import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../lib/theme';
import type { Match } from '../../types/api';
import { RemoteImage } from '../RemoteImage';

type Props = { match?: Match; variant?: 'fill' | 'strip' };

export function LiveStreamPaused({ match, variant = 'strip' }: Props) {
  const { t } = useTranslation();
  const fill = variant === 'fill';
  return (
    <View style={[fill ? styles.fill : styles.strip]} accessibilityRole="text">
      <Text style={styles.badge}>{t('matchHalftime')}</Text>
      {match ? (
        <View style={styles.scoreRow}>
          <ClubSide name={match.homeClub.name} crest={match.homeClub.crestPath} />
          <Text style={styles.score}>
            {match.homeScore}
            <Text style={styles.sep}> : </Text>
            {match.awayScore}
          </Text>
          <ClubSide name={match.awayClub.name} crest={match.awayClub.crestPath} />
        </View>
      ) : null}
      <Text style={styles.hint}>{t('matchStreamPaused')}</Text>
    </View>
  );
}

function ClubSide({ name, crest }: { name: string; crest?: string | null }) {
  return (
    <View style={styles.club}>
      <RemoteImage path={crest} variant="thumb" transparent style={styles.crest} />
      <Text style={styles.clubName} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    backgroundColor: '#050A14',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 14,
  },
  strip: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  badge: {
    color: '#111827',
    backgroundColor: '#F59E0B',
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  score: { color: '#fff', fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] },
  sep: { color: 'rgba(255,255,255,0.4)', fontWeight: '700' },
  club: { flex: 1, alignItems: 'center', gap: 8 },
  crest: { width: 48, height: 48 },
  clubName: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  hint: { ...typography.caption, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
});
