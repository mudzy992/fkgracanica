import { useState } from 'react';
import { Video } from 'lucide-react';
import { useSetLiveStream } from '../../../hooks/use-live-admin';
import type { Match } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../../components/ui/dialog';
import { useTranslation } from 'react-i18next';

export function CommentatorStreamDialog({ match }: { match: Match }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(match.liveStreamUrl ?? '');
  const save = useSetLiveStream();
  const linked = !!match.liveStreamUrl;

  const onOpen = () => {
    setUrl(match.liveStreamUrl ?? '');
    setOpen(true);
  };

  const submit = async () => {
    await save.mutateAsync({ matchId: match.id, url: url.trim() || null });
    setOpen(false);
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
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
          <p className="text-xs text-text-muted">
            Prikazuje se na javnoj live stranici preko scoreboard overlaya.
          </p>
        </DialogBody>
        <DialogFooter>
          {linked && (
            <Button
              variant="ghost"
              size="sm"
              disabled={save.isPending}
              onClick={() =>
                void save.mutateAsync({ matchId: match.id, url: null }).then(() => setOpen(false))
              }
            >
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
