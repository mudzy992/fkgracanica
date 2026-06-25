import type { CmsPageSection } from './types';
import { widgetRegistry } from './widgets/registry';
import type { WidgetType } from './widgets/schemas';

interface Props {
  section: CmsPageSection;
}

export function WidgetRenderer({ section }: Props) {
  const type = section.widgetType as WidgetType;
  const Component = widgetRegistry[type];
  if (!Component || !section.enabled) return null;
  return <Component config={section.config as never} />;
}
