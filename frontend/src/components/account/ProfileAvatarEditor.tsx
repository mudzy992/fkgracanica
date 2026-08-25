import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Trash2 } from 'lucide-react';
import { api, getAccessToken, getRefreshToken } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { mediaUrl } from '../../lib/media';
import { userInitials } from '../../lib/user-initials';
import { Button } from '../ui/button';

export function ProfileAvatarEditor() {
  const { t } = useTranslation();
  const { user, applySession } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const onPick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data: upload } = await api.post<{ path: string }>('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data } = await api.patch('/auth/profile', { avatarPath: upload.path });
      applySession({ ...user, ...data }, getAccessToken() ?? '', getRefreshToken() ?? '');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      const { data } = await api.delete('/auth/profile/avatar');
      applySession({ ...user, ...data }, getAccessToken() ?? '', getRefreshToken() ?? '');
    } finally {
      setBusy(false);
    }
  };

  const avatarSrc = mediaUrl(user.avatarPath, 'medium');

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border-subtle)] p-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-primary/15">
        {avatarSrc ? (
          <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
            {userInitials(user)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Profilna slika</p>
        <p className="text-xs text-text-muted">JPG ili PNG.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onPick}>
          <Camera className="mr-1 h-4 w-4" />
          {user.avatarPath ? 'Promijeni' : 'Dodaj'}
        </Button>
        {user.avatarPath ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void onDelete()}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {t('actions.delete')}
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFile(e)}
      />
    </div>
  );
}
