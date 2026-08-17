import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useMatch } from '../../../hooks';
import {
  useCreateMatchHighlight,
  useDeleteMatchHighlight,
} from '../../../hooks/use-match-highlights';
import { getApiErrorMessage } from '../../../lib/api-error';

export function MatchHighlightsEditor({ matchId }: { matchId: string }) {
  const { t } = useTranslation();
  const { data: match } = useMatch(matchId);
  const create = useCreateMatchHighlight(matchId);
  const remove = useDeleteMatchHighlight(matchId);
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [startSeconds, setStartSeconds] = useState('');
  const [error, setError] = useState('');
  const clips = match?.highlights ?? [];

  const add = async () => {
    try {
      setError('');
      await create.mutateAsync({
        title,
        youtubeUrl,
        startSeconds: startSeconds ? Number(startSeconds) : undefined,
      });
      setTitle('');
      setYoutubeUrl('');
      setStartSeconds('');
    } catch (err) {
      setError(getApiErrorMessage(err, t('match.highlightSaveError')));
    }
  };

  return (
    <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
      <p className="text-sm font-medium">{t('match.highlights')}</p>
      <ul className="space-y-2">
        {clips.map((clip) => (
          <li key={clip.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate">{clip.title}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={remove.isPending}
              onClick={() => void remove.mutateAsync(clip.id)}
            >
              {t('actions.delete')}
            </Button>
          </li>
        ))}
      </ul>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('match.highlightTitle')} />
      <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="YouTube URL" />
      <Input
        type="number"
        min={0}
        value={startSeconds}
        onChange={(e) => setStartSeconds(e.target.value)}
        placeholder={t('match.highlightStart')}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="button" size="sm" disabled={!title || !youtubeUrl || create.isPending} onClick={() => void add()}>
        {t('match.addHighlight')}
      </Button>
    </div>
  );
}
