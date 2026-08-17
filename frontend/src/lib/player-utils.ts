import type { Player } from '../types';

export const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const;

export const POSITION_LABELS: Record<(typeof POSITION_ORDER)[number], string> = {
  GK: 'Golman',
  DEF: 'Odbrana',
  MID: 'Vezni',
  FWD: 'Napadač',
};

export const POSITION_GROUP_LABELS: Record<(typeof POSITION_ORDER)[number], string> = {
  GK: 'Golmani',
  DEF: 'Odbrana',
  MID: 'Vezni red',
  FWD: 'Napad',
};

export function playerPositionLabel(position?: string | null): string {
  if (!position) return '—';
  return POSITION_LABELS[position as keyof typeof POSITION_LABELS] ?? position;
}

export function groupPlayersByPosition(players: Player[]) {
  return POSITION_ORDER.map((position) => ({
    position,
    label: POSITION_GROUP_LABELS[position],
    players: players.filter((p) => p.position === position),
  })).filter((g) => g.players.length > 0);
}

export function pickFormationStarters(players: Player[]) {
  const order = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'] as const;
  const pool = [...players];
  const picked: Player[] = [];
  for (const pos of order) {
    const idx = pool.findIndex((p) => p.position === pos);
    if (idx >= 0) picked.push(pool.splice(idx, 1)[0]);
  }
  while (picked.length < 11 && pool.length) picked.push(pool.shift()!);
  return picked;
}
