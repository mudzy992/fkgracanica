import { MediaPicker } from '../../../../components/admin/MediaPicker';
import { Input } from '../../../../components/ui/input';
import type { WidgetConfigMap } from '../../../../cms/widgets/schemas';
import { useTranslation } from 'react-i18next';

type Config = WidgetConfigMap['next-match'];

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function NextMatchSectionForm({ config, onChange }: Props) {
  const { t } = useTranslation();
  const c = config as Config;
  const patch = (next: Partial<Config>) => onChange({ ...c, ...next });

  return (
    <div className="space-y-3">
      <Input
        value={c.title ?? ''}
        onChange={(e) => patch({ title: e.target.value })}
        placeholder={t('admin.cmsNextMatch.titlePlaceholder')}
      />
      <MediaPicker
        value={c.backgroundImage ?? ''}
        onChange={(v) => patch({ backgroundImage: v })}
        label={t('admin.cmsNextMatch.stadiumBackground')}
      />
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={c.showLastResult !== false}
          onChange={(e) => patch({ showLastResult: e.target.checked })}
        />
        Prikaži zadnji rezultat (suptilno)
      </label>
    </div>
  );
}
