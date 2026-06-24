import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  Club,
  ClubTimelineEvent,
  ContactMessage,
  DashboardKpis,
  GalleryItem,
  HallOfFameEntry,
  Match,
  MuseumItem,
  NewsItem,
  Player,
  SearchResults,
  Sponsor,
  Trophy,
  User,
} from '../types';

export function usePublishedNews() {
  return useQuery({
    queryKey: ['news', 'published'],
    queryFn: async () => (await api.get<NewsItem[]>('/news/published')).data,
  });
}

export function useNewsList(status?: string) {
  return useQuery({
    queryKey: ['news', status],
    queryFn: async () =>
      (await api.get<NewsItem[]>('/news', { params: status ? { status } : undefined })).data,
  });
}

export function useNewsItem(idOrSlug: string) {
  return useQuery({
    queryKey: ['news', idOrSlug],
    queryFn: async () => {
      const published = (await api.get<NewsItem[]>('/news/published')).data;
      const bySlug = published.find((n) => n.slug === idOrSlug);
      if (bySlug) return bySlug;
      return (await api.get<NewsItem>(`/news/${idOrSlug}`)).data;
    },
    enabled: !!idOrSlug,
  });
}

export function useGalleryList(status?: string) {
  return useQuery({
    queryKey: ['gallery', status],
    queryFn: async () =>
      (await api.get<GalleryItem[]>('/gallery', { params: status ? { status } : { status: 'PUBLISHED' } })).data,
  });
}

export function useGalleryItem(slug: string) {
  return useQuery({
    queryKey: ['gallery', slug],
    queryFn: async () => {
      const list = (await api.get<GalleryItem[]>('/gallery', { params: { status: 'PUBLISHED' } })).data;
      const item = list.find((g) => g.slug === slug);
      if (!item) throw new Error('Not found');
      return (await api.get<GalleryItem>(`/gallery/${item.id}`)).data;
    },
    enabled: !!slug,
  });
}

export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => (await api.get<Sponsor[]>('/sponsors')).data,
  });
}

export function useTrophies() {
  return useQuery({
    queryKey: ['trophies'],
    queryFn: async () => (await api.get<Trophy[]>('/trophies')).data,
  });
}

export function useClubTimeline() {
  return useQuery({
    queryKey: ['club-timeline'],
    queryFn: async () => (await api.get<ClubTimelineEvent[]>('/club-timeline')).data,
  });
}

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => (await api.get<Player[]>('/players')).data,
  });
}

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async () => (await api.get<Club[]>('/clubs')).data,
  });
}

export function useMatches(seasonId?: string) {
  return useQuery({
    queryKey: ['matches', seasonId],
    queryFn: async () =>
      (await api.get<Match[]>('/matches', { params: seasonId ? { seasonId } : undefined })).data,
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: async () => (await api.get<Match>(`/matches/${id}`)).data,
    enabled: !!id,
  });
}

export function useHallOfFame() {
  return useQuery({
    queryKey: ['hall-of-fame'],
    queryFn: async () => (await api.get<HallOfFameEntry[]>('/hall-of-fame')).data,
  });
}

export function useMuseum() {
  return useQuery({
    queryKey: ['museum'],
    queryFn: async () => (await api.get<MuseumItem[]>('/museum')).data,
  });
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: async () => (await api.get<SearchResults>('/search', { params: { q } })).data,
    enabled: q.length >= 2,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: async () => (await api.get<Record<string, string>>('/settings/public')).data,
  });
}

export function usePrivateSettings() {
  return useQuery({
    queryKey: ['settings', 'private'],
    queryFn: async () => (await api.get<Record<string, string>>('/settings/private')).data,
  });
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => (await api.get<DashboardKpis>('/dashboard/kpis')).data,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<User[]>('/users')).data,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get('/rbac/roles')).data,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await api.get('/rbac/permissions')).data,
  });
}

export function useContactMessages() {
  return useQuery({
    queryKey: ['contact'],
    queryFn: async () => (await api.get<ContactMessage[]>('/contact')).data,
  });
}

export function useNewsletterSubscribers() {
  return useQuery({
    queryKey: ['newsletter'],
    queryFn: async () => (await api.get('/newsletter')).data,
  });
}

export function useMemberships() {
  return useQuery({
    queryKey: ['membership'],
    queryFn: async () => (await api.get('/membership')).data,
  });
}

export function useTicketingOrders() {
  return useQuery({
    queryKey: ['ticketing', 'orders'],
    queryFn: async () => (await api.get('/ticketing/orders')).data,
  });
}

export function useCmsBlocks() {
  return useQuery({
    queryKey: ['cms', 'blocks'],
    queryFn: async () => (await api.get('/cms/blocks')).data,
  });
}

export function useCmsBlock(key: string) {
  const { data, ...rest } = useCmsBlocks();
  return { data: data?.find((b: { key: string }) => b.key === key), ...rest };
}

export function useMediaAssets() {
  return useQuery({
    queryKey: ['media', 'assets'],
    queryFn: async () => (await api.get('/media/assets')).data,
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: ['audit'],
    queryFn: async () => (await api.get('/audit')).data,
  });
}

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: async () => (await api.get('/competitions')).data,
  });
}

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async (email: string) => (await api.post('/newsletter/subscribe', { email })).data,
  });
}

export function useContactSubmit() {
  return useMutation({
    mutationFn: async (body: { name: string; email: string; subject?: string; message: string }) =>
      (await api.post('/contact', body)).data,
  });
}

export function useUpdatePublicSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, string>) =>
      (await api.put('/settings/public', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['settings', 'public'] }),
  });
}

export function useUpdatePrivateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, string>) =>
      (await api.put('/settings/private', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['settings', 'private'] }),
  });
}

export * from './use-news-admin';
export * from './use-media-admin';
export * from './use-live-admin';
