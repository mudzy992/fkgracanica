import { useId, useState } from 'react';
import { Video } from 'lucide-react';
import { useSetLiveStream } from '../../../hooks/use-live-admin';
import { isInvalidChangedYouTubeUrl } from '../../../lib/youtube';
import { getApiErrorMessage } from '../../../lib/api-error';
import type { Match } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../../components/ui/dialog';
import { useTranslation } from 'react-i18next';

export function CommentatorStreamDialog({ match }: { match: Match }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(match.liveStreamUrl ?? '');
  const [error, setError] = useState('');
  const invalidUrl = error === t('video.invalidInput');
  const errorId = useId();
  const save = useSetLiveStream();
  const linked = !!match.liveStreamUrl;

  const onOpen = () => {
    setUrl(match.liveStreamUrl ?? '');
    setError('');
    setOpen(true);
  };

  const persist = async (value: string | null) => {
    try {
      await save.mutateAsync({ matchId: match.id, url: value });
      setOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, t('admin.common.saveFailed')));
    }
  };

  const submit = async () => {
    setError('');
    if (url === (match.liveStreamUrl ?? '')) { setOpen(false); return; }
    if (isInvalidChangedYouTubeUrl(url, match.liveStreamUrl)) {
      setError(t('video.invalidInput'));
      return;
    }
    await persist(url.trim() || null);
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 border-white/20 bg-white/5 px-2.5 text-xs text-white hover:bg-white/10"
        onClick={onOpen}
      >
        <Video className="mr-1.5 h-3.5 w-3.5" />
        {linked ? 'Stream ✓' : 'Stream'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen} className="max-w-md">
        <DialogHeader onClose={() => setOpen(false)}>{t('admin.streamDialog.title')}</DialogHeader>
        <DialogBody className="space-y-2">
          <Input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://youtube.com/watch?v=..."
            aria-label={t('admin.highlights.youtubeUrl')}
            aria-invalid={invalidUrl || undefined}
            aria-describedby={invalidUrl ? errorId : undefined}
          />
          {error && <p id={errorId} role="alert" className="text-sm text-danger">{error}</p>}
          <p className="text-xs text-text-muted">
            Prikazuje se na javnoj live stranici preko scoreboard overlaya.
          </p>
        </DialogBody>
        <DialogFooter>
          {linked && (
            <Button variant="ghost" size="sm" disabled={save.isPending} onClick={() => void persist(null)}>
              Ukloni
            </Button>
          )}
          <Button size="sm" onClick={() => void submit()} disabled={save.isPending}>
            Spremi
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
