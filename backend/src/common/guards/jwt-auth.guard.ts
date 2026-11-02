import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * BE-02 / Q-12(a) — D-006: globalni auth guard (APP_GUARD u app.module.ts).
 *
 * - `@Public()` rute (javne — portal, webhooks, auth/login…) preskaču JWT.
 * - Sve ostalo je default-deny: bez važećeg access tokena → 401.
 * - WS kontekst preskače — realtime gateway ima vlastitu auth na
 *   handshakeu (handleConnection: token iz auth zaglavlja ILI public
 *   klijent bez tokena za live feed).
 * - Lokalni `@UseGuards(JwtAuthGuard)` dektorai su UKLONJENI iz svih
 *   kontrolera (jedina istina = globalna registracija).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
