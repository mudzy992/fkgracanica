import { BadRequestException } from '@nestjs/common';
import type { PaginationParams } from '../common/utils/pagination.util';

/** BE-09/P-B09-6 (odobreno): polja po kojima `GET /users` smije sortirati. */
export const SORTABLE_USER_FIELDS = new Set([
  'email',
  'firstName',
  'lastName',
  'createdAt',
]);

/**
 * BE-09/P-B09-6: `sort` je bio „mrtav API” — parametar je postojao, ali ga
 * servis nije koristio (klijent dobije 200 i pogrešan redoslijed). Sada se
 * poštuje za allowlistu, a nepoznato polje je **400**.
 */
export function usersOrderBy(params: PaginationParams) {
  if (params.sort && !SORTABLE_USER_FIELDS.has(params.sort)) {
    throw new BadRequestException(
      `Nepodržano polje za sortiranje: "${params.sort}" (dozvoljeno: ${[
        ...SORTABLE_USER_FIELDS,
      ].join(', ')})`,
    );
  }
  return params.sort
    ? { [params.sort]: params.order }
    : { createdAt: params.order };
}

/** BE-08/P-B08-6: pretraga korisnika ne zavisi od velikih/malih slova. */
export function usersSearchWhere(search?: string) {
  if (!search) return {};
  const contains = { contains: search, mode: 'insensitive' as const };
  return {
    OR: [{ email: contains }, { firstName: contains }, { lastName: contains }],
  };
}
