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

export function useNewsList(
  status?: string,
  categoryId?: string,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<NewsItem[]>, 'queryKey' | 'queryFn'>,
) {
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
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
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

export function useGalleryList(
  status?: string,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<GalleryItem[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['gallery', status],
    queryFn: async () =>
      asArray<GalleryItem>(
        (await api.get('/gallery', { params: status ? { status } : { status: 'PUBLISHED' } })).data,
      ),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
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

export function usePlayers(
  options?: { clubId?: string; activeOnly?: boolean } & Omit<
    import('@tanstack/react-query').UseQueryOptions<Player[]>,
    'queryKey' | 'queryFn'
  >,
) {
  const { clubId, activeOnly, ...queryOptions } = options ?? {};
  return useQuery({
    queryKey: ['players', clubId, activeOnly],
    queryFn: async () =>
      asArray<Player>(
        (
          await api.get('/players', {
            params: {
              clubId,
              activeOnly: activeOnly ? 'true' : undefined,
            },
          })
        ).data,
      ),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
}

export function useClubs(
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<Club[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async () => asArray<Club>((await api.get('/clubs')).data),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useOwnClub(
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<Club | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['clubs', 'own'],
    queryFn: async () => (await api.get<Club | null>('/clubs/own')).data,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useMatches(
  seasonId?: string,
  roundId?: string,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<Match[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['matches', seasonId, roundId ?? 'all'],
    queryFn: async () =>
      asArray<Match>((await api.get('/matches', {
        params: {
          ...(seasonId ? { seasonId } : {}),
          ...(roundId ? { roundId } : {}),
        },
      })).data),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useMatch(
  id: string,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<Match>, 'queryKey' | 'queryFn'>,
) {
  const { enabled: optEnabled, ...rest } = options ?? {};
  return useQuery({
    queryKey: ['matches', id],
    queryFn: async () => (await api.get<Match>(`/matches/${id}`)).data,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...rest,
    enabled: !!id && (optEnabled ?? true),
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

export function useDashboardKpis(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => (await api.get<DashboardKpis>('/dashboard/kpis')).data,
    enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUsers(
  params: { page?: number; search?: string } = {},
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<import('../types/pagination').PaginatedResponse<User & { roles?: { role: { id: string; name: string } }[] }>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () =>
      (await api.get('/users', { params })).data as import('../types/pagination').PaginatedResponse<User & { roles?: { role: { id: string; name: string } }[] }>,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useRoles(
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<ReturnType<typeof asArray>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => asArray((await api.get('/rbac/roles')).data),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function usePermissions(
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<ReturnType<typeof asArray>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => asArray((await api.get('/rbac/permissions')).data),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
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

export function useAuditLog(
  params: Record<string, string | number | undefined> = {},
  options?: Omit<
    import('@tanstack/react-query').UseQueryOptions<
      import('../types/pagination').PaginatedResponse<{
        id: string;
        action: string;
        createdAt: string;
        actor?: { email: string } | null;
        entity?: string | null;
      }>
    >,
    'queryKey' | 'queryFn'
  >,
) {
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
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useCompetitions(
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<unknown[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: async () => asArray((await api.get('/competitions')).data),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useSeasons(
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<unknown[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: async () => asArray((await api.get('/seasons')).data),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
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
