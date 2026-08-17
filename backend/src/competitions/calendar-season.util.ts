export type LegacySeasonRow = {
  id: string;
  yearStart: number;
  yearEnd: number;
  isActive: boolean;
};

export type CalendarSeasonGroup = {
  yearStart: number;
  yearEnd: number;
  name: string;
  isActive: boolean;
  sourceIds: string[];
};

/** Same yearStart/yearEnd collapse to one calendar Season (migration rule). */
export function groupCalendarSeasons(rows: LegacySeasonRow[]): CalendarSeasonGroup[] {
  const map = new Map<string, CalendarSeasonGroup>();
  for (const row of rows) {
    const key = `${row.yearStart}/${row.yearEnd}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        yearStart: row.yearStart,
        yearEnd: row.yearEnd,
        name: key,
        isActive: row.isActive,
        sourceIds: [row.id],
      });
      continue;
    }
    existing.isActive = existing.isActive || row.isActive;
    existing.sourceIds.push(row.id);
  }
  return [...map.values()];
}
