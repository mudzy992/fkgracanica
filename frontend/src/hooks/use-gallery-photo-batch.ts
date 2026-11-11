import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { fetchAllMediaAssetsInFolder } from '../lib/fetch-all-media-assets';
import type { GalleryItem } from '../types';
import { useAddGalleryPhotos } from './use-content-admin';

type Phase = 'ready' | 'adding' | 'checking' | 'blocked';
type Notice = 'partial' | 'partialUnverified' | 'savedUnverified' | 'initialUnverified' | 'folderFailed' | 'refreshed' | null;
interface BatchState { phase: Phase; notice: Notice }
type Source = { paths: string[] } | { folderId: string };
const initial: BatchState = { phase: 'ready', notice: null };
const stateKey = (id: string) => ['gallery-photo-batch', id] as const;
const detailKey = (id: string) => ['gallery', id] as const;

function validDetail(detail: GalleryItem | undefined, id: string): detail is GalleryItem & { photos: NonNullable<GalleryItem['photos']> } {
  return !!detail && detail.id === id && typeof detail.title === 'string' &&
    Array.isArray(detail.photos) && detail.photos.every((photo) =>
      typeof photo?.id === 'string' && typeof photo.path === 'string');
}

async function refreshDetail(client: QueryClient, id: string): Promise<boolean> {
  try {
    // Stariji React Query zahtjev ne smije kasnije prepisati potvrđeni rezultat.
    await client.cancelQueries({ queryKey: detailKey(id), exact: true });
    const { data } = await api.get<GalleryItem>(`/gallery/${id}`, {
      timeout: 15_000, headers: { 'Cache-Control': 'no-cache' },
    });
    if (!validDetail(data, id)) return false;
    client.setQueryData(detailKey(id), data);
    return true;
  } catch {
    return false;
  }
}

/** Stanje je po albumu u QueryClientu, pa ostaje i nakon navigacije unutar taba. */
export function useGalleryPhotoBatch(galleryId: string) {
  const client = useQueryClient();
  const addPhotos = useAddGalleryPhotos();
  const key = stateKey(galleryId);
  const { data: state } = useQuery({
    queryKey: key, queryFn: async () => initial, initialData: initial,
    enabled: false, staleTime: Infinity, gcTime: Infinity,
  });
  const set = (next: BatchState) => client.setQueryData(key, next);
  const current = () => client.getQueryData<BatchState>(key)!;

  const add = async (source: Source) => {
    // Sinhroni cache lock štiti i od dvostrukog klika i od dvije montirane komponente.
    if (current().phase !== 'ready') return;
    set({ phase: 'adding', notice: null });
    try {
      let paths: string[];
      try {
        paths = 'paths' in source
          ? source.paths
          : (await fetchAllMediaAssetsInFolder(source.folderId)).map((asset) => asset.originalPath);
      } catch {
        set({ phase: 'ready', notice: 'folderFailed' });
        return;
      }
      let detail = client.getQueryData<GalleryItem>(detailKey(galleryId));
      if (!validDetail(detail, galleryId)) {
        set({ phase: 'checking', notice: null });
        if (!(await refreshDetail(client, galleryId))) {
          set({ phase: 'blocked', notice: 'initialUnverified' });
          return;
        }
        detail = client.getQueryData<GalleryItem>(detailKey(galleryId));
      }
      if (!validDetail(detail, galleryId)) {
        set({ phase: 'blocked', notice: 'initialUnverified' });
        return;
      }
      const existing = new Set(detail.photos.map((photo) => photo.path));
      const fresh = [...new Set(paths)].filter((path) => path && !existing.has(path));
      if (!fresh.length) {
        set({ phase: 'ready', notice: null });
        return;
      }
      set({ phase: 'adding', notice: null });
      let failed = false;
      try {
        await addPhotos.mutateAsync({ galleryId, paths: fresh });
      } catch {
        // I 500/timeout može doći nakon upisa; ne pretpostaviti da ništa nije dodano.
        failed = true;
      }
      set({ phase: 'checking', notice: null });
      const confirmed = await refreshDetail(client, galleryId);
      set(confirmed
        ? { phase: 'ready', notice: failed ? 'partial' : null }
        : { phase: 'blocked', notice: failed ? 'partialUnverified' : 'savedUnverified' });
    } catch {
      // Ne dopustiti novi POST kada je ishod neočekivano nepoznat.
      set({ phase: 'blocked', notice: 'partialUnverified' });
    }
  };

  const retryRefresh = async () => {
    const previous = current();
    if (previous.phase !== 'blocked') return;
    set({ ...previous, phase: 'checking' });
    const confirmed = await refreshDetail(client, galleryId);
    set(confirmed
      ? { phase: 'ready', notice: previous.notice === 'partialUnverified' ? 'partial' : 'refreshed' }
      : previous);
  };

  return { state, add, retryRefresh };
}
