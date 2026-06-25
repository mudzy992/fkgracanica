import { useState } from 'react';
import { CmsPagesList } from './CmsPagesList';
import { CmsPageCreateDialog } from './CmsPageCreateDialog';
import { CmsMenuEditor } from './CmsMenuEditor';
import { Seo } from '../../../components/seo/Seo';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

const tabs = ['pages', 'menu'] as const;

export function CmsHubPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('pages');
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <Seo title="CMS" />
      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <Button
            key={t}
            variant="ghost"
            className={cn('rounded-none border-b-2', tab === t ? 'border-primary text-primary' : 'border-transparent')}
            onClick={() => setTab(t)}
          >
            {t === 'pages' ? 'Stranice' : 'Meni'}
          </Button>
        ))}
      </div>
      {tab === 'pages' ? <CmsPagesList onCreate={() => setCreateOpen(true)} /> : <CmsMenuEditor />}
      <CmsPageCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
