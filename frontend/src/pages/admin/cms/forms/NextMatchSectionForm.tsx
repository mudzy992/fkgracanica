import { MediaPicker } from '../../../../components/admin/MediaPicker';
import { Input } from '../../../../components/ui/input';
import { Switch } from '../../../../components/ui/switch';
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
      <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
        <span className="text-sm font-medium">{t('admin.cmsWidget.showLastResult')}</span>
        <Switch checked={c.showLastResult !== false} onCheckedChange={(v) => patch({ showLastResult: v })} />
      </label>
    </div>
  );
}
