import { asArray, asRecord, asString } from './content-helpers';

export type EditionOpt = { id: string; name: string; calendarId: string; calendarName: string };

export function flattenSeasonEditions(data: unknown): EditionOpt[] {
  return asArray(data).flatMap((row) => {
    const calendar = asRecord(row);
    const calendarId = asString(calendar.id);
    const calendarName = asString(calendar.name, 'Sezona');
    return asArray(calendar.competitions).map((ed) => {
      const edition = asRecord(ed);
      const competition = asRecord(edition.competition);
      return {
        id: asString(edition.id),
        calendarId,
        calendarName,
        name: `${asString(competition.name, 'Takmičenje')} · ${calendarName}`,
      };
    });
  }).filter((e) => e.id);
}
