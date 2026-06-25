import type { CmsPageSection } from '../../../cms/types';
import { WidgetRenderer } from '../../../cms/WidgetRenderer';

interface Props {
  sections: CmsPageSection[];
  editingId?: string | null;
  draftConfig?: Record<string, unknown>;
  highlightId?: string | null;
}

export function CmsPreviewPanel({ sections, editingId, draftConfig, highlightId }: Props) {
  const preview = sections
    .filter((s) => s.enabled)
    .map((s) => (s.id === editingId && draftConfig ? { ...s, config: draftConfig } : s));

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-surface">
      <div className="border-b border-slate-200 px-3 py-2 text-sm font-medium text-text-muted">Live preview</div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-background">
        {preview.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-muted">Dodajte widget za preview.</p>
        ) : (
          preview.map((section) => (
            <div
              key={section.id}
              className={
                highlightId === section.id || editingId === section.id
                  ? 'ring-2 ring-inset ring-primary/40'
                  : undefined
              }
            >
              <WidgetRenderer section={section} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
