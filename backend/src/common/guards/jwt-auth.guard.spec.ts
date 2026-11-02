import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * BE-02 / Q-12(a): unit testovi globalnog JwtAuthGuard —
 * javne rute i ne-HTTP konteksti preskaču passport provjeru.
 */

function createContext(type: string, isPublic: boolean) {
  const getAllAndOverride = jest.fn().mockReturnValue(isPublic);
  const reflector = { getAllAndOverride } as unknown as Reflector;
  const context = {
    getType: () => type,
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
  return { reflector, context, getAllAndOverride };
}

describe('JwtAuthGuard (globalni, BE-02)', () => {
  it('@Public ruta → preskače passport (true, bez poziva strategije)', () => {
    const { reflector, context, getAllAndOverride } = createContext(
      'http',
      true,
    );
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [{}, {}]);
  });

  it('ne-HTTP kontekst (ws/rpc) → preskače (gateway ima vlastitu auth)', () => {
    const { reflector, context, getAllAndOverride } = createContext(
      'ws',
      false,
    );
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
    expect(getAllAndOverride).not.toHaveBeenCalled();
  });
});
