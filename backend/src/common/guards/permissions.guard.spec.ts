import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_ANY_KEY,
  PERMISSIONS_KEY,
} from '../decorators/permissions.decorator';
import type { AuditService } from '../../audit/audit.service';
import { PermissionsGuard } from './permissions.guard';

interface AuditCall {
  actorId?: string;
  action: string;
  metadata?: { reason?: string; required?: string[] };
}

interface RequestStub {
  user?: { id: string; email: string; permissions: string[] };
  method?: string;
  url?: string;
  ip?: string;
}

function makeGuard(
  metadata: Record<string, string[] | undefined>,
  request: RequestStub,
) {
  const reflector = {
    getAllAndOverride: (key: string) => metadata[key],
  } as unknown as Reflector;
  const log = jest.fn((_input: AuditCall) => Promise.resolve(undefined));
  const audit = { log };
  const context = {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  const guard = new PermissionsGuard(
    reflector,
    audit as unknown as AuditService,
  );
  return { guard, log, context };
}

describe('PermissionsGuard (BE-09 / P-B09-7)', () => {
  it('propušta rutu bez dekoratora', async () => {
    const { guard, context } = makeGuard({}, {});
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('propušta korisnika koji ima sve tražene dozvole', async () => {
    const { guard, context } = makeGuard(
      { [PERMISSIONS_KEY]: ['users.read', 'users.update'] },
      {
        user: {
          id: 'u1',
          email: 'a@b.c',
          permissions: ['users.read', 'users.update'],
        },
      },
    );
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('propušta ako ima bar jednu iz RequireAnyPermission', async () => {
    const { guard, context } = makeGuard(
      { [PERMISSIONS_ANY_KEY]: ['media.upload', 'media.manage'] },
      { user: { id: 'u1', email: 'a@b.c', permissions: ['media.upload'] } },
    );
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('odbija kad nedostaje dozvola i upisuje audit', async () => {
    const { guard, log, context } = makeGuard(
      { [PERMISSIONS_KEY]: ['users.read'] },
      {
        user: { id: 'u1', email: 'a@b.c', permissions: [] },
        method: 'GET',
        url: '/api/v1/users',
        ip: '10.0.0.1',
      },
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'u1',
        action: 'authz.denied',
        entityId: 'GET /api/v1/users',
        ipAddress: '10.0.0.1',
      }),
    );
    const meta = log.mock.calls[0][0].metadata;
    expect(meta?.reason).toBe('nedostaju dozvole');
    expect(meta?.required).toEqual(['users.read']);
  });

  it('odbija zahtjev bez korisnika (401/403 scenarij)', async () => {
    const { guard, log, context } = makeGuard(
      { [PERMISSIONS_KEY]: ['users.read'] },
      { method: 'GET', url: '/api/v1/users' },
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: undefined }),
    );
  });

  it('fail-closed: prazna lista dozvola ne propušta nikoga', async () => {
    const { guard, log, context } = makeGuard(
      { [PERMISSIONS_KEY]: [] },
      { user: { id: 'admin', email: 'a@b.c', permissions: ['users.read'] } },
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(log.mock.calls[0][0].metadata?.reason).toBe('prazna lista dozvola');
  });

  it('fail-closed i kad su obje liste prazne', async () => {
    const { guard, context } = makeGuard(
      { [PERMISSIONS_KEY]: [], [PERMISSIONS_ANY_KEY]: [] },
      { user: { id: 'admin', email: 'a@b.c', permissions: ['*'] } },
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('greška u audit logu ne mijenja ishod (i dalje 403)', async () => {
    const { guard, log, context } = makeGuard(
      { [PERMISSIONS_KEY]: ['users.read'] },
      { user: { id: 'u1', email: 'a@b.c', permissions: [] } },
    );
    log.mockRejectedValueOnce(new Error('db down'));
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('radi i bez AuditService-a (jedinični test bez DI)', async () => {
    const reflector = {
      getAllAndOverride: () => ['users.read'],
    } as unknown as Reflector;
    const context = {
      getHandler: () => () => undefined,
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'u1', email: 'a@b.c', permissions: [] },
        }),
      }),
    } as unknown as ExecutionContext;
    const guard = new PermissionsGuard(reflector);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('traži dozvolu i preko klase (getAllAndOverride)', async () => {
    const { guard, context } = makeGuard(
      { [PERMISSIONS_ANY_KEY]: ['rbac.read', 'rbac.update'] },
      { user: { id: 'u1', email: 'a@b.c', permissions: ['settings.read'] } },
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
