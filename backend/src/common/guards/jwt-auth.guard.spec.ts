import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * BE-02 + BE-04/P-B04-1: unit testovi globalnog JwtAuthGuard.
 *
 * Stub passport-jwt strategija (jwtFromRequest → uvijek null) daje
 * determinističko "nevažeći/odsutan token" ponašanje bez vanjskih zavisnosti:
 *  - @Public → tiha autorizacija → TRUE (anon prolazi; req.user ostaje nepopunjen)
 *  - zaštićeno → UnauthorizedException (NE javni bypass)
 *  - ws → TRUE (gateway ima vlastitu auth)
 */

function createStubStrategy(): void {
  passport.use(
    'jwt',
    new JwtStrategy(
      { jwtFromRequest: () => null, secretOrKey: 'test-secret' },
      () => false,
    ),
  );
}

function createContext(type: string, isPublic: boolean) {
  const getAllAndOverride = jest.fn().mockReturnValue(isPublic);
  const reflector = { getAllAndOverride } as unknown as Reflector;
  const context = {
    getType: () => type,
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ headers: {} }),
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
  return { reflector, context, getAllAndOverride };
}

describe('JwtAuthGuard (globalni, BE-02/BE-04)', () => {
  beforeAll(() => {
    createStubStrategy();
  });

  it('@Public HTTP + bez tokena → TIHA autorizacija: TRUE (anon prolazi)', async () => {
    const { reflector, context, getAllAndOverride } = createContext(
      'http',
      true,
    );
    const guard = new JwtAuthGuard(reflector);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [{}, {}]);
  });

  it('zaštićena HTTP ruta + bez tokena → ODBIJENO (nema javnog bypassa)', async () => {
    const { reflector, context } = createContext('http', false);
    const guard = new JwtAuthGuard(reflector);

    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it('ne-HTTP kontekst (ws/rpc) → preskače (gateway ima vlastitu auth)', async () => {
    const { reflector, context, getAllAndOverride } = createContext(
      'ws',
      false,
    );
    const guard = new JwtAuthGuard(reflector);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(getAllAndOverride).not.toHaveBeenCalled();
  });
});
