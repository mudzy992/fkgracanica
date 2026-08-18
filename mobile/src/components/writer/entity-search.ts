import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import type { EntityHit } from './writer-article';

export type EntityKind = 'player' | 'match' | 'gallery';

function playerHit(raw: unknown): EntityHit {
  const r = asRecord(raw);
  const name = [asString(r.firstName), asString(r.lastName)].filter(Boolean).join(' ');
  return { id: asString(r.id), label: name || '—' };
}

function matchHit(raw: unknown): EntityHit {
  const r = asRecord(raw);
  const home = asString(asRecord(r.homeClub).name, '?');
  const away = asString(asRecord(r.awayClub).name, '?');
  const date = asString(r.scheduledAt).slice(0, 10);
  return { id: asString(r.id), label: `${home} vs ${away}${date ? ` · ${date}` : ''}` };
}

function galleryHit(raw: unknown): EntityHit {
  const r = asRecord(raw);
  return { id: asString(r.id), label: asString(r.title, '—') };
}

export async function loadEntityHits(kind: EntityKind): Promise<EntityHit[]> {
  if (kind === 'player') {
    const { data } = await api.get('/players');
    return asArray(asRecord(data).data ?? data).map(playerHit);
  }
  if (kind === 'match') {
    const { data } = await api.get('/matches');
    return asArray(asRecord(data).data ?? data).map(matchHit);
  }
  const { data } = await api.get('/gallery');
  return asArray(asRecord(data).data ?? data).map(galleryHit);
}

export function filterEntityHits(items: EntityHit[], query: string): EntityHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, 40);
  return items.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 40);
}
