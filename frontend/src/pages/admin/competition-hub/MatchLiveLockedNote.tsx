import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badge';
import { matchStatusLabels } from './match-form-status';
import type { MatchStatus } from '../../../types';

/** Utakmica je u toku: status i rezultat se mijenjaju u komentator panelu. */
export function MatchLiveLockedNote({ status }: { status?: MatchStatus }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <Badge variant="danger">{status ? matchStatusLabels[status] : ''}</Badge>
      <span>{t('admin.matchForm.liveLocked')}</span>
    </div>
  );
}
