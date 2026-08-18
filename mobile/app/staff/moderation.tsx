import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ListSkeleton } from '../../src/components/ListSkeleton';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { CountStrip } from '../../src/components/staff/CountStrip';
import { ModerationPreviewSheet, type QueueItem } from '../../src/components/staff/ModerationPreviewSheet';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { useAuth } from '../../src/lib/auth';
import { hasPermission } from '../../src/lib/permissions';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

type Kind = 'news' | 'gallery' | 'live';

function mapItem(raw: unknown, fallback: string): QueueItem {
  const item = asRecord(raw);
  const titled = asString(item.title);
  const home = asString(asRecord(item.homeClub).name);
  const away = asString(asRecord(item.awayClub).name);
  const title = titled || (home || away ? `${home} ${String(item.homeScore ?? 0)}:${String(item.awayScore ?? 0)} ${away}` : fallback);
  return {
    id: asString(item.id),
    title,
    excerpt: asString(item.excerpt || item.description),
    coverPath: asString(item.coverPath || item.imagePath) || null,
    status: asString(item.status || item.reportStatus, 'PENDING'),
  };
}

export default function ModerationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [news, setNews] = useState<QueueItem[]>([]);
  const [gallery, setGallery] = useState<QueueItem[]>([]);
  const [live, setLive] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState<{ kind: Kind; item: QueueItem } | null>(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [newsRes, galleryRes, liveRes] = await Promise.all([
        api.get('/news', { params: { status: 'PENDING' } }),
        api.get('/gallery', { params: { status: 'PENDING' } }),
        api.get('/live/pending'),
      ]);
      setNews(asArray(newsRes.data).map((item) => mapItem(item, t('news'))));
      setGallery(asArray(galleryRes.data).map((item) => mapItem(item, t('gallery'))));
      setLive(asArray(liveRes.data).map((item) => mapItem(item, t('live'))));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (kind: Kind, id: string, status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    if (kind === 'live') {
      if (status === 'PUBLISHED') await api.post(`/live/matches/${id}/approve`);
    } else {
      const path = kind === 'news' ? `/news/${id}/status` : `/gallery/${id}/status`;
      await api.patch(path, { status });
    }
    setPreview(null);
    await load();
  };

  const canModerate =
    hasPermission(user, 'news.approve') || hasPermission(user, 'gallery.approve') || hasPermission(user, 'live.approve');

  if (!canModerate) {
    return (
      <RequireAuth returnTo="/staff/moderation">
        <ScreenEmpty message={t('noModeratorAccess')} icon="lock-closed-outline" />
      </RequireAuth>
    );
  }

  const Block = ({ title, items, kind }: { title: string; items: QueueItem[]; kind: Kind }) => (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {items.length === 0 ? <Text style={[styles.empty, { color: colors.textMuted }]}>{t('emptyQueue')}</Text> : null}
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => setPreview({ kind, item })} style={[styles.row, { borderTopColor: colors.border }]}>
          <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{item.status}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <RequireAuth returnTo="/staff/moderation">
      <Screen scroll refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}>
        <SectionHeader title={t('moderator')} subtitle={t('pendingQueue')} />
        <CountStrip
          items={[
            { label: t('newsPending'), value: news.length },
            { label: t('galleryPending'), value: gallery.length },
            { label: t('livePending'), value: live.length },
          ]}
        />
        {hasPermission(user, 'contact.read') ? (
          <Pressable onPress={() => router.push('/staff/admin/comms')} style={[styles.inbox, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text }}>{t('inbox')}</Text>
          </Pressable>
        ) : null}
        {loading && news.length + gallery.length + live.length === 0 ? <ListSkeleton rows={3} /> : null}
        {error ? <ScreenEmpty message={t('error')} actionLabel={t('retry')} onAction={() => void load()} compact /> : null}
        {!error ? (
          <>
            <Block title={`${t('newsPending')} (${news.length})`} items={news} kind="news" />
            <Block title={`${t('galleryPending')} (${gallery.length})`} items={gallery} kind="gallery" />
            <Block title={`${t('livePending')} (${live.length})`} items={live} kind="live" />
          </>
        ) : null}
        <ModerationPreviewSheet
          item={preview?.item ?? null}
          onClose={() => setPreview(null)}
          onApprove={() => preview && void setStatus(preview.kind, preview.item.id, 'PUBLISHED')}
          onReject={preview?.kind === 'live' ? undefined : () => preview && void setStatus(preview.kind, preview.item.id, 'DRAFT')}
        />
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  title: { ...typography.heading },
  row: { gap: 2, borderTopWidth: 1, paddingTop: spacing.sm },
  name: { ...typography.body },
  meta: { ...typography.caption },
  empty: { ...typography.caption },
  inbox: { borderWidth: 1, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center' },
});
