import { RichContent } from '../../components/public/RichContent';
import { PublicSection } from '../../components/public/shell/PublicSection';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['rich-text'] };

export function RichTextWidget({ config }: Props) {
  if (!config.html) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <PublicSection>
        <PremiumCard className="p-6 sm:p-8" hover={false}>
          <RichContent html={config.html} />
        </PremiumCard>
      </PublicSection>
    </section>
  );
}
