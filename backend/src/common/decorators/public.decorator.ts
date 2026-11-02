import { SetMetadata } from '@nestjs/common';

/**
 * BE-02 / Q-12(a) — D-006: globalni JwtAuthGuard preskače rute označene
 * ovim dekoratorom (default-deny: SVE je zaštićeno osim izričito javnog).
 *
 * Popis odobrenih javnih ruta (70) živi u `route-access.spec.ts` — test pada
 * ako se pojavi @Public van tog popisa ili nestane s odobrene rute.
 */
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
