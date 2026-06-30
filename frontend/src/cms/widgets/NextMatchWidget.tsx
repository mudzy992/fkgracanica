/** @deprecated Utakmice su u Hero widgetu — uklonite sekciju iz CMS-a */
import type { WidgetConfigMap } from './schemas';

export function NextMatchWidget({ config }: { config: WidgetConfigMap['next-match'] }) {
  void config;
  return null;
}
