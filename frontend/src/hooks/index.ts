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
    queryKey: ['gallery', 'slug', slug],
    queryFn: async () => (await api.get<GalleryItem>(`/gallery/slug/${slug}`)).data,
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

export function usePlayers(options?: { clubId?: string; activeOnly?: boolean }) {
  return useQuery({
    queryKey: ['players', options?.clubId, options?.activeOnly],
    queryFn: async () =>
      asArray<Player>(
        (
          await api.get('/players', {
            params: {
              clubId: options?.clubId,
              activeOnly: options?.activeOnly ? 'true' : undefined,
            },
          })
        ).data,
      ),
  });
}

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async () => asArray<Club>((await api.get('/clubs')).data),
  });
}

export function useOwnClub() {
  return useQuery({
    queryKey: ['clubs', 'own'],
    queryFn: async () => (await api.get<Club | null>('/clubs/own')).data,
  });
}

export function useMatches(seasonId?: string, roundId?: string) {
  return useQuery({
    queryKey: ['matches', seasonId, roundId ?? 'all'],
    queryFn: async () =>
      asArray<Match>((await api.get('/matches', {
        params: {
          ...(seasonId ? { seasonId } : {}),
          ...(roundId ? { roundId } : {}),
        },
      })).data),
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

export function useModuleFlags() {
  return useQuery({
    queryKey: ['settings', 'module-flags'],
    queryFn: async () => (await api.get<Record<string, string>>('/settings/module-flags')).data,
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

export {
  useMyMembership,
  useMemberships,
  useMembershipDetail,
  useRegisterMembership,
  useActivateMembership,
  useRenewMembership,
  useSuspendMembership,
  useCancelMembership,
  useCreateMembershipAdmin,
} from './use-membership';

export {
  useMyTicketOrders,
  useMyTicketOrders as useTicketingOrders,
  useMatchAvailability,
  useReserveTicket,
  useRequestTicketRefund,
  useCancelMyTicketOrder,
} from './use-ticketing';

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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings', 'public'] });
      void qc.invalidateQueries({ queryKey: ['settings', 'module-flags'] });
    },
  });
}

export function useUpdatePrivateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, string>) =>
      (await api.put('/settings/private', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings', 'private'] });
      void qc.invalidateQueries({ queryKey: ['settings', 'module-flags'] });
    },
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
export * from './use-ticketing';
export * from './use-ticketing-admin';
export * from './use-contact-admin';
export * from './use-newsletter-admin';
export * from './use-heritage-admin';
export * from './use-confirm';
export * from './use-search';
export * from './use-public-web';
