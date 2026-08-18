import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { CountStrip } from '../../../src/components/staff/CountStrip';
import { Screen } from '../../../src/components/primitives/Screen';
import { SectionHeader } from '../../../src/components/primitives/SectionHeader';
import { WriterList, type WriterNewsItem } from '../../../src/components/writer/WriterList';
import { ListSkeleton } from '../../../src/components/ListSkeleton';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';

function mapNews(raw: unknown): WriterNewsItem {
  const r = asRecord(raw);
  return { id: asString(r.id), title: asString(r.title, '—'), status: asString(r.status, 'DRAFT') };
}

export default function WriterListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<WriterNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const [drafts, pending] = await Promise.all([
        api.get('/news', { params: { status: 'DRAFT' } }),
        api.get('/news', { params: { status: 'PENDING' } }),
      ]);
      setItems([...asArray(drafts.data).map(mapNews), ...asArray(pending.data).map(mapNews)]);
    } catch {
      setError(true);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RequirePermission permission="news.submit" returnTo="/staff/writer">
      <Screen scroll>
        <SectionHeader title={t('writerHint')} />
        <CountStrip
          items={[
            { label: t('drafts'), value: items.filter((i) => i.status === 'DRAFT').length },
            { label: t('pendingReview'), value: items.filter((i) => i.status === 'PENDING').length },
          ]}
        />
        {loading ? <ListSkeleton rows={3} /> : null}
        {error ? <ScreenEmpty message={t('error')} actionLabel={t('retry')} onAction={() => void load()} compact /> : null}
        {!loading && !error ? (
          <WriterList
            items={items}
            onSelect={(item) => router.push(`/staff/writer/${item.id}`)}
            onCreate={() => router.push('/staff/writer/new')}
          />
        ) : null}
      </Screen>
    </RequirePermission>
  );
}
