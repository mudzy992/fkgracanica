import type { EntityFieldDef } from './entity-crud-types';

export type ClubOpt = { id: string; name: string };

export const playerBaseFields: EntityFieldDef[] = [
  { key: 'firstName', labelKey: 'firstName', required: true },
  { key: 'lastName', labelKey: 'lastName', required: true },
  { key: 'clubId', labelKey: 'clubId' },
  { key: 'position', labelKey: 'position', type: 'choice', choices: ['GK', 'DEF', 'MID', 'FWD'] },
  { key: 'number', labelKey: 'number', type: 'number' },
  { key: 'bio', labelKey: 'bio', type: 'multiline' },
];

export const emptyPlayerValues = (): Record<string, string> => ({
  firstName: '',
  lastName: '',
  clubId: '',
  position: 'MID',
  number: '',
  bio: '',
});

export const buildPlayerBody = (values: Record<string, string>) => ({
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  clubId: values.clubId || undefined,
  position: values.position || undefined,
  number: values.number ? Number(values.number) : undefined,
  bio: values.bio.trim() || undefined,
});

export const playerFieldsWithClubs = (clubs: ClubOpt[]): EntityFieldDef[] =>
  playerBaseFields.map((f) =>
    f.key === 'clubId' && clubs.length
      ? { ...f, type: 'choice', choices: clubs.map((c) => ({ value: c.id, label: c.name })) }
      : f,
  );
