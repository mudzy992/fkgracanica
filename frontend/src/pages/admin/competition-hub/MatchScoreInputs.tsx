import { Input } from '../../../components/ui/input';
import { clampScore } from './match-form-status';
import { useTranslation } from 'react-i18next';

interface Props {
  homeScore: number;
  awayScore: number;
  onHome: (n: number) => void;
  onAway: (n: number) => void;
  labeled?: boolean;
}

export function MatchScoreInputs({ homeScore, awayScore, onHome, onAway, labeled }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        {labeled && (
          <label className="mb-1 block text-xs text-text-muted">
            {t('admin.scoreInputs.home')}
          </label>
        )}
        <Input
          type="number"
          min={0}
          step={1}
          value={homeScore}
          onChange={(e) => onHome(clampScore(e.target.value))}
        />
      </div>
      <div>
        {labeled && (
          <label className="mb-1 block text-xs text-text-muted">
            {t('admin.scoreInputs.away')}
          </label>
        )}
        <Input
          type="number"
          min={0}
          step={1}
          value={awayScore}
          onChange={(e) => onAway(clampScore(e.target.value))}
        />
      </div>
    </div>
  );
}
