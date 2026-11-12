import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Select } from '../../../../components/ui/select';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../../components/ui/input';
import { MediaPicker } from '../../../../components/admin/MediaPicker';
import type { WidgetConfigMap } from '../../../../cms/widgets/schemas';

type HeroConfig = WidgetConfigMap['hero'];

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function HeroSectionForm({ config, onChange }: Props) {
  const { t } = useTranslation();
  const hero = {
    title: '',
    buttons: [],
    showMatches: true,
    showLastResult: true,
    backgroundDisplay: 'all' as const,
    ...config,
  } as HeroConfig;

  const patch = (next: Partial<HeroConfig>) => onChange({ ...hero, ...next });

  const setButton = (index: number, field: 'label' | 'url' | 'variant', value: string) => {
    /* v8 ignore next */
    const buttons = [...(hero.buttons ?? [])];
    buttons[index] = {
      ...buttons[index],
      label: buttons[index]?.label ?? '',
      url: buttons[index]?.url ?? '',
      [field]: value,
    };
    patch({ buttons });
  };

  return (
    <div className="space-y-3">
      <Input
        value={hero.foundedYear ?? ''}
        onChange={(e) => patch({ foundedYear: e.target.value })}
        placeholder={t('admin.cmsWidget.foundedYear')}
      />
      <Input
        value={hero.title}
        onChange={(e) => patch({ title: e.target.value })}
        placeholder={t('admin.cmsWidget.titleRequired')}
      />
      <Input
        value={hero.subtitle ?? ''}
        onChange={(e) => patch({ subtitle: e.target.value })}
        placeholder={t('admin.cmsWidget.subtitle')}
      />
      <MediaPicker
        value={hero.backgroundImage ?? ''}
        onChange={(v) => patch({ backgroundImage: v })}
        label={t('admin.cmsWidget.background')}
      />
      <label className="block text-sm text-text-muted">
        <span className="mb-1 block font-medium text-text">
          {t('admin.cmsWidget.backgroundDisplay')}
        </span>
        <Select
          value={hero.backgroundDisplay ?? 'all'}
          onChange={(e) =>
            patch({ backgroundDisplay: e.target.value as HeroConfig['backgroundDisplay'] })
          }
        >
          <option value="all">{t('admin.cmsWidget.bg.all')}</option>
          <option value="desktop">{t('admin.cmsWidget.bg.desktop')}</option>
          <option value="mobile">{t('admin.cmsWidget.bg.mobile')}</option>
          <option value="none">{t('admin.cmsWidget.bg.none')}</option>
        </Select>
      </label>
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={hero.showMatches !== false}
          onChange={(e) => patch({ showMatches: e.target.checked })}
        />
        {t('admin.cmsWidget.showNextMatch')}
      </label>
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={hero.showLastResult !== false}
          onChange={(e) => patch({ showLastResult: e.target.checked })}
        />
        {t('admin.cmsWidget.showLastResult')}
      </label>
      <Card className="space-y-2 p-3">
        <p className="text-sm font-medium">{t('admin.cmsWidget.buttons')}</p>
        {(hero.buttons ?? []).map((btn, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <Input
              value={btn.label}
              onChange={(e) => setButton(i, 'label', e.target.value)}
              placeholder={t('admin.cmsWidget.buttonLabel')}
              className="flex-1"
            />
            <Input
              value={btn.url}
              onChange={(e) => setButton(i, 'url', e.target.value)}
              placeholder={t('admin.cmsWidget.buttonUrl')}
              className="flex-1"
            />
            <Select className="w-auto"
              value={btn.variant ?? 'primary'}
              onChange={(e) => setButton(i, 'variant', e.target.value)}
            >
              <option value="primary">{t('admin.cmsWidget.variant.primary')}</option>
              <option value="outline">{t('admin.cmsWidget.variant.outline')}</option>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => patch({ buttons: hero.buttons.filter((_, idx) => idx !== i) })}
            >
              {t('actions.remove')}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            patch({
              buttons: [...(hero.buttons ?? []), { label: '', url: '/', variant: 'primary' }],
            })
          }
        >
          + Dugme
        </Button>
      </Card>
    </div>
  );
}
