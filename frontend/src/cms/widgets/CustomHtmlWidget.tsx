import { RichContent } from '../../components/public/RichContent';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['custom-html'] };

export function CustomHtmlWidget({ config }: Props) {
  if (!config.html?.trim()) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <RichContent html={config.html} />
    </section>
  );
}
