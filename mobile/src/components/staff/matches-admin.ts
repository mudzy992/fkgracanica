import type { EntityFieldDef } from './entity-crud-types';

export type ClubOpt = { id: string; name: string };
export type SeasonOpt = { id: string; name: string };

export const emptyMatchValues = (): Record<string, string> => ({
  homeClubId: '',
  awayClubId: '',
  scheduledAt: '',
  venue: '',
  seasonId: '',
});

export const matchFields = (clubChoices: { value: string; label: string }[]): EntityFieldDef[] => [
  { key: 'homeClubId', labelKey: 'homeClub', type: 'choice', required: true, choices: clubChoices },
  { key: 'awayClubId', labelKey: 'awayClub', type: 'choice', required: true, choices: clubChoices },
  { key: 'scheduledAt', labelKey: 'scheduledAt', required: true },
  { key: 'venue', labelKey: 'venue' },
];

export const buildMatchBody = (values: Record<string, string>, seasonId: string) => ({
  seasonId,
  homeClubId: values.homeClubId,
  awayClubId: values.awayClubId,
  scheduledAt: new Date(values.scheduledAt).toISOString(),
  venue: values.venue.trim() || undefined,
});

export const matchAdminStyles = {
  header: { padding: 16, gap: 8, borderBottomWidth: 1 as const },
  filters: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 6 },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, maxWidth: 140 },
  list: { padding: 16, flexGrow: 1 },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
};
