import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddMatchComment } from '../../../hooks/use-live-admin';
import { useAddReportComment } from '../../../hooks/use-live-report';
import type { LiveComment, Match } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

interface Props {
  match: Match;
  reportMode?: boolean;
  eventMinute?: number;
}

export function CommentatorCommentPanel({ match, reportMode, eventMinute = 0 }: Props) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const addLive = useAddMatchComment();
  const addReport = useAddReportComment();
  const comments = match.liveComments ?? [];
  const canComment = reportMode || match.status === 'LIVE' || match.status === 'HALFTIME';

  const submit = () => {
    if (!message.trim()) return;
    if (reportMode) {
      void addReport.mutateAsync({
        matchId: match.id,
        message: message.trim(),
        minute: eventMinute,
      });
    } else {
      void addLive.mutateAsync({ matchId: match.id, message: message.trim() });
    }
    setMessage('');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{t('admin.commentPanel.liveComments')}</h3>
      {canComment && (
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('admin.commentPanel.placeholder')}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Button
            onClick={submit}
            disabled={addLive.isPending || addReport.isPending || !message.trim()}
          >
            Pošalji
          </Button>
        </div>
      )}
      <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
        {comments.map((c: LiveComment) => (
          <li key={c.id} className="rounded border border-slate-100 bg-surface p-2">
            {c.minute != null && (
              <span className="font-semibold text-primary">{c.minute}&apos; </span>
            )}
            {c.message}
          </li>
        ))}
        {!comments.length && <li className="text-text-muted">{t('admin.commentPanel.empty')}</li>}
      </ul>
    </div>
  );
}
