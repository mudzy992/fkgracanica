import { Switch } from '../ui/switch';
import { useTranslation } from 'react-i18next';
import { api, getAccessToken, getRefreshToken } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export function LiveNotifyToggle() {
  const { t } = useTranslation();
  const { user, applySession } = useAuth();
  if (!user) return null;
  const enabled = user.notifyLiveMatch !== false;

  const onToggle = async (next: boolean) => {
    const { data } = await api.patch('/auth/preferences', { notifyLiveMatch: next });
    applySession({ ...user, ...data }, getAccessToken() ?? '', getRefreshToken() ?? '');
  };

  return (
    <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] p-4">
      <div>
        <p className="text-sm font-semibold">{t('common.livePushTitle')}</p>
        <p className="text-xs text-text-muted">{t('common.livePushHint')}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={(v) => void onToggle(v)} id="live-push" />
    </div>
  );
}
