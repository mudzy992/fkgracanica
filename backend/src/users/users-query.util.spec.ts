import { BadRequestException } from '@nestjs/common';
import {
  SORTABLE_USER_FIELDS,
  usersOrderBy,
  usersSearchWhere,
} from './users-query.util';
import type { PaginationParams } from '../common/utils/pagination.util';

const params = (over: Partial<PaginationParams>): PaginationParams => ({
  page: 1,
  limit: 20,
  skip: 0,
  order: 'desc',
  ...over,
});

/**
 * BE-09/P-B09-6 + BE-08/P-B08-6: `sort` se poštuje za allowlistu polja
 * (nepoznato → 400), a pretraga korisnika ignoriše velika/mala slova.
 */
describe('users-query.util (BE-09 / P-B09-6, BE-08 / P-B08-6)', () => {
  it('bez sorta ostaje createdAt + zadati smjer', () => {
    expect(usersOrderBy(params({}))).toEqual({ createdAt: 'desc' });
    expect(usersOrderBy(params({ order: 'asc' }))).toEqual({
      createdAt: 'asc',
    });
  });

  it('sortira po dozvoljenim poljima', () => {
    expect(usersOrderBy(params({ sort: 'email' }))).toEqual({
      email: 'desc',
    });
    expect(usersOrderBy(params({ sort: 'lastName', order: 'asc' }))).toEqual({
      lastName: 'asc',
    });
  });

  it('nepoznato polje sortiranja → 400 (prije: tiho ignorisano)', () => {
    expect(() => usersOrderBy(params({ sort: 'passwordHash' }))).toThrow(
      BadRequestException,
    );
  });

  it('allowlist sadrži tačno očekivana polja', () => {
    expect([...SORTABLE_USER_FIELDS].sort()).toEqual([
      'createdAt',
      'email',
      'firstName',
      'lastName',
    ]);
  });

  it('pretraga bez pojma ne dodaje filter', () => {
    expect(usersSearchWhere(undefined)).toEqual({});
  });

  it('pretraga koristi insensitive mod na sva tri polja', () => {
    expect(usersSearchWhere('grač')).toEqual({
      OR: [
        { email: { contains: 'grač', mode: 'insensitive' } },
        { firstName: { contains: 'grač', mode: 'insensitive' } },
        { lastName: { contains: 'grač', mode: 'insensitive' } },
      ],
    });
  });
});
