import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useMatch } from '../../../hooks';
import {
  useCreateMatchHighlight,
  useDeleteMatchHighlight,
} from '../../../hooks/use-match-highlights';
import { getApiErrorMessage } from '../../../lib/api-error';
import { parseYouTubeId } from '../../../lib/youtube';
import { useConfirm } from '../../../hooks/use-confirm';

export function MatchHighlightsEditor({ matchId }: { matchId: string }) {
  const { t } = useTranslation();
  const { data: match } = useMatch(matchId);
  const create = useCreateMatchHighlight(matchId);
  const remove = useDeleteMatchHighlight(matchId);
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [startSeconds, setStartSeconds] = useState('');
  const [error, setError] = useState('');
  const [invalidUrl, setInvalidUrl] = useState(false);
  const errorId = useId();
  const { confirm, dialog } = useConfirm();
  const clips = match?.highlights ?? [];

  /**
   * FE-04/P-FE04-2: brisanje highlighta je išlo na JEDAN klik, bez potvrde i bez
   * undo-a — pogrešan klik je nepovratno brisao klip sa utakmice.
   */
  const deleteClip = async (clip: { id: string; title: string }) => {
    const ok = await confirm({
      title: t('match.highlightDeleteTitle', 'Obrisati highlight?'),
      description: t('match.highlightDeleteDesc', '„{{title}}” će biti obrisan.', {
        title: clip.title,
      }),
      confirmLabel: t('actions.delete'),
      variant: 'danger',
    });
    if (ok) await remove.mutateAsync(clip.id);
  };

  const add = async () => {
    try {
      setError('');
      setInvalidUrl(false);
      const trimmedUrl = youtubeUrl.trim();
      if (!parseYouTubeId(trimmedUrl)) {
        setInvalidUrl(true);
        setError(t('video.invalidInput'));
        return;
      }
      await create.mutateAsync({
        title,
        youtubeUrl: trimmedUrl,
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
      {dialog}
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
              onClick={() => void deleteClip(clip)}
            >
              {t('actions.delete')}
            </Button>
          </li>
        ))}
      </ul>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('match.highlightTitle')}
      />
      <Input
        value={youtubeUrl}
        onChange={(e) => {
          setYoutubeUrl(e.target.value);
          if (invalidUrl) { setInvalidUrl(false); setError(''); }
        }}
        placeholder={t('admin.highlights.youtubeUrl')}
        aria-invalid={invalidUrl || undefined}
        aria-describedby={invalidUrl ? errorId : undefined}
      />
      <Input
        type="number"
        min={0}
        value={startSeconds}
        onChange={(e) => setStartSeconds(e.target.value)}
        placeholder={t('match.highlightStart')}
      />
      {error ? <p id={errorId} role="alert" className="text-sm text-danger">{error}</p> : null}
      <Button
        type="button"
        size="sm"
        disabled={!title || !youtubeUrl || create.isPending}
        onClick={() => void add()}
      >
        {t('match.addHighlight')}
      </Button>
    </div>
  );
}
