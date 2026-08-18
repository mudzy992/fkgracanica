import { CustomHtmlEditor } from '../../../../components/admin/CustomHtmlEditor';
import { RichTextEditor } from '../../../../components/admin/RichTextEditor';
import type { WidgetType } from '../../../../cms/widgets/schemas';
import { widgetMeta } from '../../../../cms/widgets/schemas';
import { HeroSectionForm } from './HeroSectionForm';
import { NewsFeedSectionForm } from './NewsFeedSectionForm';
import { NextMatchSectionForm } from './NextMatchSectionForm';
import { GenericSectionForm } from './GenericSectionForm';
import { ClubAboutCtaSectionForm } from './ClubAboutCtaSectionForm';

interface Props {
  widgetType: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function CmsSectionForm({ widgetType, config, onChange }: Props) {
  const label = widgetMeta[widgetType as WidgetType]?.label ?? widgetType;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-muted">Widget: {label}</p>
      {widgetType === 'hero' && <HeroSectionForm config={config} onChange={onChange} />}
      {widgetType === 'news-feed' && <NewsFeedSectionForm config={config} onChange={onChange} />}
      {widgetType === 'rich-text' && <RichTextSectionForm config={config} onChange={onChange} />}
      {widgetType === 'custom-html' && <CustomHtmlSectionForm config={config} onChange={onChange} />}
      {widgetType === 'footer-about' && <FooterAboutForm config={config} onChange={onChange} />}
      {widgetType === 'next-match' && <NextMatchSectionForm config={config} onChange={onChange} />}
      {widgetType === 'club-about-cta' && <ClubAboutCtaSectionForm config={config} onChange={onChange} />}
      {!['hero', 'news-feed', 'rich-text', 'footer-about', 'next-match', 'custom-html', 'club-about-cta'].includes(widgetType) && (
        <GenericSectionForm widgetType={widgetType} config={config} onChange={onChange} />
      )}
    </div>
  );
}

function CustomHtmlSectionForm({ config, onChange }: Pick<Props, 'config' | 'onChange'>) {
  return <CustomHtmlEditor value={String(config.html ?? '')} onChange={(html) => onChange({ html })} />;
}

function RichTextSectionForm({ config, onChange }: Pick<Props, 'config' | 'onChange'>) {
  return <RichTextEditor value={String(config.html ?? '')} onChange={(html) => onChange({ html })} />;
}

function FooterAboutForm({ config, onChange }: Pick<Props, 'config' | 'onChange'>) {
  return (
    <textarea
      value={String(config.text ?? '')}
      onChange={(e) => onChange({ text: e.target.value })}
      rows={4}
      className="w-full rounded-lg border border-slate-200 bg-background p-2 text-sm"
      placeholder="Tekst o klubu"
    />
  );
}
