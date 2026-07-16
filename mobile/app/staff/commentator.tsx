import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { RequirePermission } from '../../src/components/RequirePermission';
import { CommentatorClockPanel } from '../../src/components/staff/CommentatorClockPanel';
import { CommentatorCommentForm } from '../../src/components/staff/CommentatorCommentForm';
import { CommentatorEventsPanel } from '../../src/components/staff/CommentatorEventsPanel';
import { CommentatorMatchSelector, type MatchOption } from '../../src/components/staff/CommentatorMatchSelector';
import { CommentatorReportPanel } from '../../src/components/staff/CommentatorReportPanel';
import { CommentatorStoppagePanel } from '../../src/components/staff/CommentatorStoppagePanel';
import { CommentatorStreamPanel } from '../../src/components/staff/CommentatorStreamPanel';
import { createLiveActionRunner } from '../../src/components/staff/commentator-api';
import { api } from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/api-error';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { spacing } from '../../src/lib/theme';

export default function CommentatorScreen() {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [selectedId, setSelectedId] = useState('');

  const run = useMemo(
    () => createLiveActionRunner(t('commentatorActionFailed')),
    [t],
  );

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/matches');
      const items = asArray(data).map((match, index) => {
        const item = asRecord(match);
        return {
          id: asString(item.id, String(index)),
          title: `${asString(asRecord(item.homeClub).name, t('commentatorHome'))} ${t('vs')} ${asString(asRecord(item.awayClub).name, t('commentatorAway'))}`,
        };
      });
      setMatches(items);
      setSelectedId((current) => current || items[0]?.id || '');
    } catch (err) {
      setMatches([]);
      Alert.alert(t('error'), getApiErrorMessage(err, t('error')));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RequirePermission permission="live.manage" returnTo="/staff/commentator">
      <Screen scroll contentStyle={{ gap: spacing.md }}>
        <SectionHeader title={t('commentatorTitle')} subtitle={t('commentatorSubtitle')} />
        <CommentatorMatchSelector matches={matches} selectedId={selectedId} onSelect={setSelectedId} />
        {selectedId ? (
          <>
            <CommentatorClockPanel matchId={selectedId} run={run} />
            <CommentatorStoppagePanel matchId={selectedId} run={run} />
            <CommentatorEventsPanel matchId={selectedId} run={run} />
            <CommentatorCommentForm matchId={selectedId} run={run} />
            <CommentatorStreamPanel matchId={selectedId} run={run} />
            <CommentatorReportPanel matchId={selectedId} run={run} />
          </>
        ) : null}
      </Screen>
    </RequirePermission>
  );
}
