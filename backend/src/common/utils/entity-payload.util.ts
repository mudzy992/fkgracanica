import { BadRequestException } from '@nestjs/common';

/**
 * Allowlista polja za admin CRUD (BE-08 / P-B08-2).
 *
 * Prije: `sponsors`, `trophies`, `museum`, `hall-of-fame`, `club-timeline`
 * prosljeđivali su sirovi `@Body()` u Prisma (`data as never`) → klijent je
 * mogao postaviti `id`, `createdAt`, `sortOrder` ili izmišljeno polje
 * (PrismaClientValidationError = 500). Sada: nepoznato polje → **400**,
 * sistemska polja zabranjena, tipovi i dužine provjereni.
 */
export type FieldKind = 'string' | 'int' | 'boolean' | 'json' | 'enum';

export type FieldRule = {
  kind: FieldKind;
  /** Obavezno pri kreiranju. */
  required?: boolean;
  /** Dozvoljeno je poslati `null`. */
  nullable?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  values?: readonly string[];
};

export type EntitySpec = Record<string, FieldRule>;

const ALWAYS_FORBIDDEN = new Set(['id', 'createdAt', 'updatedAt']);

function fail(message: string): never {
  throw new BadRequestException(message);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseString(name: string, value: unknown, rule: FieldRule): string {
  if (typeof value !== 'string') fail(`Polje "${name}" mora biti tekst`);
  const text = value.trim();
  if (rule.maxLength && text.length > rule.maxLength) {
    fail(`Polje "${name}" je predugačko (max ${rule.maxLength})`);
  }
  return text;
}

function parseIntNumber(name: string, value: unknown, rule: FieldRule): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    fail(`Polje "${name}" mora biti cijeli broj`);
  }
  if (rule.min !== undefined && n < rule.min)
    fail(`Polje "${name}" je premalo`);
  if (rule.max !== undefined && n > rule.max)
    fail(`Polje "${name}" je preveliko`);
  return n;
}

function parseBoolean(name: string, value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fail(`Polje "${name}" mora biti boolean`);
}

function parseValue(name: string, value: unknown, rule: FieldRule): unknown {
  if (value === null) {
    if (rule.nullable) return null;
    fail(`Polje "${name}" ne može biti prazno`);
  }
  switch (rule.kind) {
    case 'string':
      return parseString(name, value, rule);
    case 'int':
      return parseIntNumber(name, value, rule);
    case 'boolean':
      return parseBoolean(name, value);
    case 'enum': {
      const text = parseString(name, value, rule);
      if (!rule.values?.includes(text))
        fail(`Polje "${name}" ima neispravnu vrijednost`);
      return text;
    }
    case 'json':
      return value;
  }
}

export function parseEntityPayload(
  body: unknown,
  spec: EntitySpec,
  mode: 'create' | 'update',
): Record<string, unknown> {
  if (!isPlainObject(body)) fail('Neispravan sadržaj zahtjeva');
  const data: Record<string, unknown> = {};

  for (const key of Object.keys(body)) {
    if (ALWAYS_FORBIDDEN.has(key)) fail(`Polje "${key}" nije dozvoljeno`);
    if (!Object.hasOwn(spec, key)) fail(`Nepoznato polje "${key}"`);
  }

  for (const [name, rule] of Object.entries(spec)) {
    const present = Object.hasOwn(body, name) && body[name] !== undefined;
    if (!present) {
      if (mode === 'create' && rule.required) {
        fail(`Polje "${name}" je obavezno`);
      }
      continue;
    }
    data[name] = parseValue(name, body[name], rule);
  }

  if (mode === 'update' && Object.keys(data).length === 0) {
    fail('Nema polja za izmjenu');
  }
  return data;
}

const MAX_IDS = 200;

/** Validacija `ids` za `reorder` rute (ne-array je prije rušio `.map`). */
export function parseIdList(raw: unknown, max = MAX_IDS): string[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    fail('Lista ID-eva je obavezna');
  }
  if (raw.length > max) fail(`Najviše ${max} stavki u listi`);
  const ids = raw.map((item) => {
    if (typeof item !== 'string' || !item.trim()) fail('Neispravan ID u listi');
    return item.trim();
  });
  if (new Set(ids).size !== ids.length) fail('Lista sadrži duple ID-eve');
  return ids;
}
