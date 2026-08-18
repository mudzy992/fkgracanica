import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { LeagueMatchesSection } from '../league/LeagueMatchesSection';
import { LeagueSeasonChips } from '../league/LeagueSeasonChips';
import { LeagueStandingsList } from '../league/LeagueStandingsList';
import type { ClubParticipation } from './load-club-public';
import { loadClubCompetition, type ClubCompetitionData } from './load-club-competition';

type Tab = 'rounds' | 'standings';
type Props = { clubId: string; participations: ClubParticipation[] };

function pickDefault(items: ClubParticipation[]): ClubParticipation | undefined {
  const activeLeague = items.filter((p) => p.isActive && p.isLeague);
  const pool = activeLeague.length ? activeLeague : items.filter((p) => p.isActive);
  const source = pool.length ? pool : items;
  return [...source].sort((a, b) => b.yearStart - a.yearStart)[0];
}

export function ClubCompetitionSection({ clubId, participations }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const initial = pickDefault(participations)?.seasonId ?? '';
  const [seasonId, setSeasonId] = useState(initial);
  const [tab, setTab] = useState<Tab>('rounds');
  const [data, setData] = useState<ClubCompetitionData | null>(null);

  const seasons = useMemo(
    () => participations.map((p) => ({ id: p.seasonId, name: p.label })),
    [participations],
  );

  const load = useCallback(async (id: string) => {
    if (!clubId || !id) {
      setData(null);
      return;
    }
    try {
      setData(await loadClubCompetition(clubId, id));
    } catch {
      setData(null);
    }
  }, [clubId]);

  useEffect(() => {
    void load(seasonId);
  }, [load, seasonId]);

  if (!participations.length || !seasonId) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {t('clubCompetitions')}
      </Text>
      <LeagueSeasonChips
        seasons={seasons}
        seasonId={seasonId}
        onChange={setSeasonId}
      />
      <View style={styles.tabs}>
        <TabChip
          label={t('clubRounds')}
          active={tab === 'rounds'}
          onPress={() => setTab('rounds')}
        />
        <TabChip
          label={t('clubStandingsTab')}
          active={tab === 'standings'}
          onPress={() => setTab('standings')}
        />
      </View>
      {tab === 'rounds' ? (
        <LeagueMatchesSection matches={data?.matches ?? []} locale={i18n.language} />
      ) : (
        <LeagueStandingsList rows={data?.standings ?? []} />
      )}
    </View>
  );
}

function TabChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.background,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipLabel, { color: active ? colors.white : colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: {
    ...typography.heading,
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
  },
  tabs: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipLabel: { ...typography.caption, fontWeight: '700' },
});
