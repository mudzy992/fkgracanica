import { Link } from 'react-router-dom';
import { useNewsList } from '../../../hooks';
import { Button } from '../../../components/ui/button';
import { contentStatusLabel } from '../../../lib/content-status-labels';
import { HomeKpiGrid } from './HomeKpiGrid';
import { RoleHomeShell } from './RoleHomeShell';

export function WriterHome() {
  const drafts = useNewsList('DRAFT');
  const pending = useNewsList('PENDING');
  const queue = [...(drafts.data ?? []), ...(pending.data ?? [])].slice(0, 6);

  return (
    <RoleHomeShell
      seo="Writer"
      title="Writer — kontrolna tabla"
      hint="Pišete i predajete. Objavu radi moderator."
    >
      <HomeKpiGrid
        items={[
          {
            key: 'drafts',
            label: 'Nacrti',
            value: drafts.data?.length ?? 0,
            href: '/admin/news',
            hint: 'Vijesti u izradi',
          },
          {
            key: 'pending',
            label: 'Na odobrenju',
            value: pending.data?.length ?? 0,
            href: '/admin/news',
            hint: 'Čeka moderatora',
          },
          {
            key: 'gallery',
            label: 'Galerija',
            value: 'Novi album',
            href: '/admin/gallery',
            hint: 'Složite album i predajte',
          },
        ]}
      />
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/admin/news">
          <Button>Nova vijest</Button>
        </Link>
        <Link to="/admin/gallery">
          <Button variant="outline">Novi album</Button>
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        {queue.length === 0 ? (
          <li className="px-4 py-6 text-sm text-text-muted">Nema nacrta ni predaja.</li>
        ) : (
          queue.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="truncate font-medium">{item.title}</span>
              <span className="shrink-0 text-xs text-text-muted">{contentStatusLabel(item.status)}</span>
            </li>
          ))
        )}
      </ul>
    </RoleHomeShell>
  );
}
