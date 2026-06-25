import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { Button } from '../../../components/ui/button';
import { widgetMeta } from '../../../cms/widgets/schemas';
import type { WidgetType } from '../../../cms/widgets/schemas';
import type { CmsPageSection } from '../../../cms/types';
import { CmsSectionForm } from './forms/CmsSectionForm';

interface Props {
  section: CmsPageSection | null;
  open: boolean;
  draftConfig: Record<string, unknown>;
  dirty: boolean;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (config: Record<string, unknown>) => void;
  onSave: () => void;
}

export function CmsSectionEditDialog({
  section,
  open,
  draftConfig,
  dirty,
  isPending,
  onOpenChange,
  onChange,
  onSave,
}: Props) {
  const label = section
    ? (widgetMeta[section.widgetType as WidgetType]?.label ?? section.widgetType)
    : '';

  const requestClose = () => {
    if (dirty && !window.confirm('Ima nesačuvanih izmjena. Zatvoriti?')) return;
    onOpenChange(false);
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) requestClose();
      }}
      title={section ? `Uredi: ${label}` : 'Uredi sekciju'}
      dirty={dirty}
      size="lg"
    >
      {section && (
        <div className="space-y-4">
          <CmsSectionForm widgetType={section.widgetType} config={draftConfig} onChange={onChange} />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={requestClose}>
              Odustani
            </Button>
            <Button onClick={onSave} disabled={isPending || !dirty}>
              Sačuvaj sekciju
            </Button>
          </div>
        </div>
      )}
    </AdminFormSheet>
  );
}
