import { Link } from 'react-router-dom';
import { useGalleryList, useNewsList } from '../../../hooks';
import { usePendingLiveReports } from '../../../hooks/use-live-admin';
import { Button } from '../../../components/ui/button';
import { HomeKpiGrid } from './HomeKpiGrid';
import { RoleHomeShell } from './RoleHomeShell';

export function ModeratorHome() {
  const news = useNewsList('PENDING');
  const gallery = useGalleryList('PENDING');
  const live = usePendingLiveReports();
  const loading = news.isLoading || gallery.isLoading || live.isLoading;

  return (
    <RoleHomeShell
      seo="Moderator"
      title="Moderator — kontrolna tabla"
      hint="Odobravate vijesti, galerije i live izvještaje. Settings ne dirate."
    >
      <HomeKpiGrid
        items={[
          {
            key: 'news',
            label: 'Vijesti',
            value: loading ? '…' : (news.data?.length ?? 0),
            href: '/admin/news',
            hint: 'Na odobrenju',
          },
          {
            key: 'gallery',
            label: 'Galerije',
            value: loading ? '…' : (gallery.data?.length ?? 0),
            href: '/admin/gallery',
            hint: 'Na odobrenju',
          },
          {
            key: 'live',
            label: 'Live izvještaji',
            value: loading ? '…' : (live.data?.length ?? 0),
            href: '/admin/live/pending',
            hint: 'Nakon utakmice',
          },
        ]}
      />
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/admin/news">
          <Button>Red vijesti</Button>
        </Link>
        <Link to="/admin/gallery">
          <Button variant="outline">Red galerija</Button>
        </Link>
        <Link to="/admin/live/pending">
          <Button variant="outline">Live odobrenje</Button>
        </Link>
        <Link to="/admin/comms">
          <Button variant="outline">Inbox</Button>
        </Link>
      </div>
    </RoleHomeShell>
  );
}
