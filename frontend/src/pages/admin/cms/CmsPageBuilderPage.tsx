import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useCmsPages,
  useDeleteCmsSection,
  useReorderCmsSections,
  useUpdateCmsPage,
  useUpdateCmsSection,
} from '../../../hooks/use-cms-pages';
import { asArray } from '../../../lib/as-array';
import { Seo } from '../../../components/seo/Seo';
import { Button } from '../../../components/ui/button';
import type { CmsPage, CmsPageSection } from '../../../cms/types';
import { CmsWidgetPicker } from './CmsWidgetPicker';
import { CmsPreviewPanel } from './CmsPreviewPanel';
import { CmsSortableSections } from './CmsSortableSections';
import { CmsPageMetaForm } from './CmsPageMetaForm';
import { CmsSectionEditDialog } from './CmsSectionEditDialog';

export function CmsPageBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCmsPages(true);
  const page = useMemo(() => asArray<CmsPage>(data).find((p) => p.id === id), [data, id]);
  const updatePage = useUpdateCmsPage();
  const updateSection = useUpdateCmsSection(page?.id ?? '');
  const deleteSection = useDeleteCmsSection(page?.id ?? '');
  const reorder = useReorderCmsSections(page?.id ?? '');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [editSection, setEditSection] = useState<CmsPageSection | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState<Record<string, unknown>>({});
  const [meta, setMeta] = useState({ title: '', slug: '', status: 'DRAFT' });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (page) setMeta({ title: page.title, slug: page.slug, status: page.status });
  }, [page?.id, page?.title, page?.slug, page?.status]);

  const sections = page?.sections ?? [];

  const openEdit = (s: CmsPageSection) => {
    setEditSection(s);
    setDraftConfig(s.config ?? {});
    setDirty(false);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditSection(null);
    setDirty(false);
  };

  const saveSection = async () => {
    if (!editSection) return;
    await updateSection.mutateAsync({ sectionId: editSection.id, config: draftConfig });
    closeEdit();
  };

  if (!isLoading && !page) {
    return <p className="p-8 text-text-muted">Stranica nije pronađena.</p>;
  }

  return (
    <>
      <Seo title={`CMS: ${page?.title ?? ''}`} />
      <Link to="/admin/cms" className="mb-4 inline-block text-sm text-accent hover:underline">
        ← Nazad na CMS
      </Link>
      {page && (
        <CmsPageMetaForm
          page={page}
          meta={meta}
          onChange={setMeta}
          onSave={() => void updatePage.mutateAsync({ id: page.id, ...meta })}
          isPending={updatePage.isPending}
        />
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Sekcije</h2>
            <Button size="sm" onClick={() => setPickerOpen(true)}>
              + Widget
            </Button>
          </div>
          {sections.length > 0 ? (
            <CmsSortableSections
              sections={sections}
              selectedId={editSection?.id ?? null}
              onSelect={openEdit}
              onReorder={(ids) => void reorder.mutateAsync(ids)}
              onDelete={(sid) => {
                if (editSection?.id === sid) closeEdit();
                void deleteSection.mutateAsync(sid);
              }}
              onToggleEnabled={(sid, enabled) => {
                void updateSection.mutateAsync({ sectionId: sid, enabled });
              }}
            />
          ) : (
            <p className="text-sm text-text-muted">Nema sekcija.</p>
          )}
        </div>
        <div className="sticky top-4 h-[calc(100dvh-8rem)] min-h-[24rem]">
          <CmsPreviewPanel
            sections={sections}
            editingId={editOpen ? editSection?.id : null}
            draftConfig={dirty ? draftConfig : undefined}
            highlightId={editSection?.id}
          />
        </div>
      </div>
      {page && <CmsWidgetPicker pageId={page.id} open={pickerOpen} onOpenChange={setPickerOpen} />}
      <CmsSectionEditDialog
        section={editSection}
        open={editOpen}
        draftConfig={draftConfig}
        dirty={dirty}
        isPending={updateSection.isPending}
        onOpenChange={(o) => (o ? setEditOpen(true) : closeEdit())}
        onChange={(c) => {
          setDraftConfig(c);
          setDirty(true);
        }}
        onSave={() => void saveSection()}
      />
    </>
  );
}
