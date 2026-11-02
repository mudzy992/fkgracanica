import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * BE-02/Q-12(a) + BE-04/P-B04-1: globalni auth guard (APP_GUARD).
 *
 * - HTTP + zaštićeno: default-deny bez važećeg access tokena → 401.
 * - HTTP + `@Public()`: **TIHA autorizacija** — važeći Bearer popunjava
 *   `req.user` (kontroleri tada poštuju admin/status parametre), a bez
 *   tokena ili s nevažećim tokenom ruta ostaje javna (try/catch → true).
 *   Tako `?admin=1`/`?status=DRAFT` rade SAMO za prijavljene (P-B04-1).
 * - WS kontekst preskače — realtime gateway ima vlastitu auth na handshakeu.
 * - Lokalni `@UseGuards(JwtAuthGuard)` dekoratori su UKLONJENI (globalna
 *   registracija = jedina istina).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isPublic) {
      // strogi režim: passport baca UnauthorizedException → 401
      return super.canActivate(context);
    }

    // Tiha autorizacija (P-B04-1): validan token → req.user popunjen;
    // bez tokena / nevažeći → i dalje javni pristup.
    try {
      await super.canActivate(context);
      return true;
    } catch {
      return true;
    }
  }
}
