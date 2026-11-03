import { BadRequestException } from '@nestjs/common';
import {
  EntitySpec,
  parseEntityPayload,
  parseIdList,
} from './entity-payload.util';

const SPEC: EntitySpec = {
  name: { kind: 'string', required: true, maxLength: 10 },
  tier: { kind: 'enum', values: ['GOLD', 'SILVER'] },
  year: { kind: 'int', min: 1900, max: 2100, nullable: true },
  featured: { kind: 'boolean' },
  meta: { kind: 'json' },
};

describe('entity-payload.util (BE-08 / P-B08-2)', () => {
  it('prihvata samo polja iz allowliste (create)', () => {
    expect(
      parseEntityPayload(
        { name: ' Klub ', tier: 'GOLD', year: 2020, featured: 'true' },
        SPEC,
        'create',
      ),
    ).toEqual({ name: 'Klub', tier: 'GOLD', year: 2020, featured: true });
  });

  it('odbija nepoznato polje (prije: Prisma 500)', () => {
    expect(() =>
      parseEntityPayload({ name: 'x', hacked: 1 }, SPEC, 'create'),
    ).toThrow(BadRequestException);
  });

  it('odbija sistemska polja id/createdAt/updatedAt', () => {
    for (const key of ['id', 'createdAt', 'updatedAt']) {
      expect(() =>
        parseEntityPayload({ name: 'x', [key]: 'v' }, SPEC, 'create'),
      ).toThrow(BadRequestException);
    }
  });

  it('zahtijeva obavezna polja pri kreiranju', () => {
    expect(() => parseEntityPayload({ tier: 'GOLD' }, SPEC, 'create')).toThrow(
      /obavezno/,
    );
  });

  it('update bez ijednog polja je 400', () => {
    expect(() => parseEntityPayload({}, SPEC, 'update')).toThrow(
      /Nema polja za izmjenu/,
    );
  });

  it('update dozvoljava djelimičan payload', () => {
    expect(parseEntityPayload({ tier: 'SILVER' }, SPEC, 'update')).toEqual({
      tier: 'SILVER',
    });
  });

  it('provjerava enum vrijednosti', () => {
    expect(() =>
      parseEntityPayload({ name: 'x', tier: 'PLATINUM' }, SPEC, 'create'),
    ).toThrow(/neispravnu vrijednost/);
  });

  it('provjerava dužinu, tip i opseg broja', () => {
    expect(() =>
      parseEntityPayload({ name: '12345678901' }, SPEC, 'create'),
    ).toThrow(/predugačko/);
    expect(() => parseEntityPayload({ name: 5 }, SPEC, 'create')).toThrow(
      /mora biti tekst/,
    );
    expect(() =>
      parseEntityPayload({ name: 'x', year: 1800 }, SPEC, 'create'),
    ).toThrow(/premalo/);
    expect(() =>
      parseEntityPayload({ name: 'x', year: 2020.5 }, SPEC, 'create'),
    ).toThrow(/cijeli broj/);
  });

  it('nullable polje prihvata null, nenullable odbija', () => {
    expect(
      parseEntityPayload({ name: 'x', year: null }, SPEC, 'create'),
    ).toEqual({ name: 'x', year: null });
    expect(() => parseEntityPayload({ name: null }, SPEC, 'create')).toThrow(
      /ne može biti prazno/,
    );
  });

  it('body koji nije objekat je 400', () => {
    expect(() => parseEntityPayload(['x'], SPEC, 'create')).toThrow(
      /Neispravan sadržaj/,
    );
    expect(() => parseEntityPayload(null, SPEC, 'create')).toThrow(
      /Neispravan sadržaj/,
    );
  });

  it('json polje prolazi bez izmjene', () => {
    const meta = { a: [1, 2] };
    expect(parseEntityPayload({ name: 'x', meta }, SPEC, 'create')).toEqual({
      name: 'x',
      meta,
    });
  });

  it('parseIdList prihvata trimmed ID-eve', () => {
    expect(parseIdList([' a ', 'b'])).toEqual(['a', 'b']);
  });

  it('parseIdList odbija ne-array, prazno, duple i predugačku listu', () => {
    expect(() => parseIdList('abc')).toThrow(/obavezna/);
    expect(() => parseIdList([])).toThrow(/obavezna/);
    expect(() => parseIdList(['a', 'a'])).toThrow(/duple/);
    expect(() => parseIdList(['a', 'b'], 1)).toThrow(/Najviše 1/);
    expect(() => parseIdList([1])).toThrow(/Neispravan ID/);
  });
});
