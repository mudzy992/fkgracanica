import 'reflect-metadata';

jest.mock('@prisma/client', () => {
  const makeSentinel = (): unknown => {
    const target: Record<string, unknown> = {};
    return new Proxy(target, {
      get: (t, prop) => {
        if (prop === 'PrismaClient') return class PrismaClientMock {};
        if (prop === 'then' || prop === 'toJSON') return undefined;
        if (prop === 'toString') return () => '[prisma-mock]';
        if (prop === Symbol.toPrimitive) return () => '[prisma-mock]';
        if (typeof prop === 'symbol') return Reflect.get(t, prop) as unknown;
        if (!(prop in t)) t[prop] = makeSentinel();
        return t[prop];
      },
      has: () => true,
    });
  };
  return makeSentinel();
});
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { buildWhere } from './search-queries.util';
import { SearchQueryDto } from './dto/search-query.dto';

/**
 * BE-08/P-B08-6 (odobreno 2026-11-03): pretraga je bila case-sensitive i `q`
 * nije imao ograničenje dužine.
 */
describe('pretraga (BE-08 / P-B08-6)', () => {
  it('svaki facet traži bez obzira na velika/mala slova', () => {
    const where = JSON.stringify(buildWhere('news', 'gračanica'));
    expect(where).toContain('"mode":"insensitive"');
    expect(where).toContain('gračanica');
  });

  it('upit ide u `contains` sa insensitive modom za sve facet-e', () => {
    for (const facet of ['players', 'clubs', 'matches', 'galleries'] as const) {
      expect(JSON.stringify(buildWhere(facet, 'X'))).toContain(
        '"mode":"insensitive"',
      );
    }
  });

  it('DTO odbija q duži od 100 znakova', async () => {
    const dto = plainToInstance(SearchQueryDto, { q: 'x'.repeat(101) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'q')).toBe(true);
  });

  it('DTO prihvata q do 100 znakova', async () => {
    const dto = plainToInstance(SearchQueryDto, { q: 'x'.repeat(100) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'q')).toBe(false);
  });
});
