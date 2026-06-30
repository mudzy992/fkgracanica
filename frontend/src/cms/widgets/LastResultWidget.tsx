/** @deprecated Spojeno u next-match — uklonite sekciju iz CMS-a */
import type { WidgetConfigMap } from './schemas';

export function LastResultWidget({ config }: { config: WidgetConfigMap['last-result'] }) {
  void config;
  return null;
}
