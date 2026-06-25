import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type {
  Club,
  ClubTimelineEvent,
  DashboardKpis,
  GalleryItem,
  HallOfFameEntry,
  Match,
  MuseumItem,
  NewsItem,
  Player,
  Sponsor,
  Trophy,
  User,
} from '../types';

export function usePublishedNews(categoryId?: string) {
  return useQuery({
    queryKey: ['news', 'published', categoryId],
    queryFn: async () =>
      asArray<NewsItem>(
        (await api.get('/news/published', {
          params: categoryId ? { categoryId } : undefined,
        })).data,
      ),
  });
}

export function useNewsList(status?: string, categoryId?: string) {
  return useQuery({
    queryKey: ['news', status, categoryId],
    queryFn: async () =>
      asArray<NewsItem>(
        (await api.get('/news', {
          params: {
            ...(status ? { status } : {}),
            ...(categoryId ? { categoryId } : {}),
          },
        })).data,
      ),
  });
}

export function useNewsItem(idOrSlug: string) {
  return useQuery({
    queryKey: ['news', idOrSlug],
    queryFn: async () => {
      try {
        return (await api.get<NewsItem>(`/news/slug/${idOrSlug}`)).data;
      } catch {
        return (await api.get<NewsItem>(`/news/${idOrSlug}`)).data;
      }
    },
    enabled: !!idOrSlug,
  });
}

export function useGalleryList(status?: string) {
  return useQuery({
    queryKey: ['gallery', status],
    queryFn: async () =>
      asArray<GalleryItem>(
        (await api.get('/gallery', { params: status ? { status } : { status: 'PUBLISHED' } })).data,
      ),
  });
}

export function useGalleryItem(slug: string) {
  return useQuery({
    queryKey: ['gallery', slug],
    queryFn: async () => {
      const list = asArray<GalleryItem>(
        (await api.get('/gallery', { params: { status: 'PUBLISHED' } })).data,
      );
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
    queryFn: async () => asArray<Sponsor>((await api.get('/sponsors')).data),
  });
}

export function useTrophies() {
  return useQuery({
    queryKey: ['trophies'],
    queryFn: async () => asArray<Trophy>((await api.get('/trophies')).data),
  });
}

export function useClubTimeline() {
  return useQuery({
    queryKey: ['club-timeline'],
    queryFn: async () => asArray<ClubTimelineEvent>((await api.get('/club-timeline')).data),
  });
}

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => asArray<Player>((await api.get('/players')).data),
  });
}

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async () => asArray<Club>((await api.get('/clubs')).data),
  });
}

export function useMatches(seasonId?: string) {
  return useQuery({
    queryKey: ['matches', seasonId],
    queryFn: async () =>
      asArray<Match>((await api.get('/matches', { params: seasonId ? { seasonId } : undefined })).data),
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
    queryFn: async () => asArray<HallOfFameEntry>((await api.get('/hall-of-fame')).data),
  });
}

export function useMuseum() {
  return useQuery({
    queryKey: ['museum'],
    queryFn: async () => asArray<MuseumItem>((await api.get('/museum')).data),
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

export function useUsers(params: { page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () =>
      (await api.get('/users', { params })).data as import('../types/pagination').PaginatedResponse<User & { roles?: { role: { id: string; name: string } }[] }>,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => asArray((await api.get('/rbac/roles')).data),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => asArray((await api.get('/rbac/permissions')).data),
  });
}

export function useMemberships() {
  return useQuery({
    queryKey: ['membership'],
    queryFn: async () => asArray((await api.get('/membership')).data),
  });
}

export function useTicketingOrders() {
  return useQuery({
    queryKey: ['ticketing', 'orders'],
    queryFn: async () => asArray((await api.get('/ticketing/orders')).data),
  });
}

export function useAuditLog(params: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: ['audit', params],
    queryFn: async () =>
      (await api.get('/audit', { params })).data as import('../types/pagination').PaginatedResponse<{
        id: string;
        action: string;
        createdAt: string;
        actor?: { email: string } | null;
        entity?: string | null;
      }>,
  });
}

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: async () => asArray((await api.get('/competitions')).data),
  });
}

export function useSeasons() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: async () => asArray((await api.get('/competitions/seasons/list')).data),
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

export * from './use-news-comments';
export * from './use-news-admin';
export * from './use-media-admin';
export * from './use-live-admin';
export * from './use-paginated-query';
export * from './use-users-admin';
export * from './use-notifications';
export * from './use-content-admin';
export * from './use-competition-admin';
export * from './use-ticketing-admin';
export * from './use-contact-admin';
export * from './use-newsletter-admin';
export * from './use-heritage-admin';
export * from './use-confirm';
export * from './use-search';
export * from './use-public-web';
