import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { RequirePermission } from '../../src/components/RequirePermission';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { CommentatorClockPanel } from '../../src/components/staff/CommentatorClockPanel';
import { CommentatorCommentForm } from '../../src/components/staff/CommentatorCommentForm';
import { CommentatorEventsPanel } from '../../src/components/staff/CommentatorEventsPanel';
import { CommentatorMatchSelector, type MatchOption } from '../../src/components/staff/CommentatorMatchSelector';
import { CommentatorReportPanel } from '../../src/components/staff/CommentatorReportPanel';
import { CommentatorScoreboard } from '../../src/components/staff/CommentatorScoreboard';
import { CommentatorStoppagePanel } from '../../src/components/staff/CommentatorStoppagePanel';
import { CommentatorStreamPanel } from '../../src/components/staff/CommentatorStreamPanel';
import { CountStrip } from '../../src/components/staff/CountStrip';
import { createLiveActionRunner } from '../../src/components/staff/commentator-api';
import { api } from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/api-error';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { deskCounts, filterCommentatorDesk } from '../../src/lib/desk-counts';
import { spacing } from '../../src/lib/theme';

export default function CommentatorScreen() {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const run = useMemo(() => createLiveActionRunner(t('commentatorActionFailed')), [t]);

  const load = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const { data } = await api.get('/matches');
      const items = asArray(data).map((match, index) => {
        const item = asRecord(match);
        return {
          id: asString(item.id, String(index)),
          title: `${asString(asRecord(item.homeClub).name, t('commentatorHome'))} ${t('vs')} ${asString(asRecord(item.awayClub).name, t('commentatorAway'))}`,
          status: asString(item.status),
          reportStatus: asString(item.reportStatus),
          scheduledAt: asString(item.scheduledAt),
        };
      });
      const desk = filterCommentatorDesk(items);
      setMatches(desk);
      setSelectedId((current) => {
        if (current && desk.some((m) => m.id === current)) return current;
        const live = desk.find((m) => m.status === 'LIVE' || m.status === 'HALFTIME');
        return live?.id || desk[0]?.id || '';
      });
    } catch (err) {
      setMatches([]);
      setError(true);
      Alert.alert(t('error'), getApiErrorMessage(err, t('error')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const desk = deskCounts(matches.map((m) => ({ status: m.status ?? '', reportStatus: m.reportStatus })));
  const selected = matches.find((m) => m.id === selectedId);
  const isLive = selected?.status === 'LIVE' || selected?.status === 'HALFTIME';
  const showReport = selected?.status === 'FINISHED' || isLive;

  return (
    <RequirePermission permission="live.manage" returnTo="/staff/commentator">
      <Screen scroll contentStyle={{ gap: spacing.md }}>
        <SectionHeader title={t('commentatorSubtitle')} />
        <CountStrip
          items={[
            { label: t('liveNow'), value: desk.live },
            { label: t('scheduledMatches'), value: desk.scheduled },
            { label: t('reportsPending'), value: desk.reports },
          ]}
        />
        {loading ? <ListSkeleton rows={3} /> : null}
        {error ? <ScreenEmpty message={t('error')} actionLabel={t('retry')} onAction={() => void load()} compact /> : null}
        {!loading && !error && matches.length === 0 ? (
          <ScreenEmpty message={t('commentatorDeskEmpty')} icon="calendar-outline" compact />
        ) : null}
        {!loading && !error ? (
          <CommentatorMatchSelector matches={matches} selectedId={selectedId} onSelect={setSelectedId} />
        ) : null}
        {selectedId ? <CommentatorScoreboard matchId={selectedId} /> : null}
        {selectedId ? <CommentatorClockPanel matchId={selectedId} run={run} /> : null}
        {selectedId && isLive ? (
          <>
            <CommentatorStoppagePanel matchId={selectedId} run={run} />
            <CommentatorEventsPanel matchId={selectedId} run={run} />
            <CommentatorCommentForm matchId={selectedId} run={run} />
            <CommentatorStreamPanel matchId={selectedId} run={run} />
          </>
        ) : null}
        {selectedId && !isLive ? <ScreenEmpty message={t('commentatorPanelsLocked')} compact /> : null}
        {selectedId && showReport ? <CommentatorReportPanel matchId={selectedId} run={run} /> : null}
      </Screen>
    </RequirePermission>
  );
}
