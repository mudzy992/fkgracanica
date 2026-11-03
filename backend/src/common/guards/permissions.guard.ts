import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../audit/audit.service';
import {
  PERMISSIONS_ANY_KEY,
  PERMISSIONS_KEY,
} from '../decorators/permissions.decorator';
import { AuthUser } from '../types/auth-user.type';

interface GuardedRequest {
  user?: AuthUser;
  method?: string;
  originalUrl?: string;
  url?: string;
  ip?: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // `undefined` = ruta nema dekorator (javna/self-service) → propusti.
    // Prazna lista (`@RequirePermissions()`) = greška u kodu → **fail-closed**
    // (BE-09/P-B09-7; prije je takva ruta propuštala svakoga).
    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredAny = this.reflector.getAllAndOverride<string[] | undefined>(
      PERMISSIONS_ANY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (required === undefined && requiredAny === undefined) {
      return true;
    }
    if (!required?.length && !requiredAny?.length) {
      await this.deny(context, required, requiredAny, 'prazna lista dozvola');
    }

    const request = context.switchToHttp().getRequest<GuardedRequest>();
    const user = request.user;
    const perms = user?.permissions ?? [];
    const hasAll =
      !required?.length || required.every((p) => perms.includes(p));
    const hasAny =
      !requiredAny?.length || requiredAny.some((p) => perms.includes(p));
    if (!user || !hasAll || !hasAny) {
      await this.deny(context, required, requiredAny, 'nedostaju dozvole');
    }
    return true;
  }

  /** 403 se upisuje u audit log (userId + ruta, bez tijela zahtjeva). */
  private async deny(
    context: ExecutionContext,
    required: string[] | undefined,
    requiredAny: string[] | undefined,
    reason: string,
  ): Promise<never> {
    const request = context.switchToHttp().getRequest<GuardedRequest>();
    try {
      await this.audit.log({
        actorId: request.user?.id,
        action: 'authz.denied',
        entity: 'Route',
        entityId:
          `${request.method ?? ''} ${request.url ?? ''}`.trim().slice(0, 200) ||
          undefined,
        metadata: {
          reason,
          required: required ?? [],
          requiredAny: requiredAny ?? [],
        },
        ipAddress: request.ip,
      });
    } catch {
      // Audit ne smije promijeniti ishod autorizacije (npr. DB nedostupna).
    }
    throw new ForbiddenException('Nedostaju dozvole');
  }
}
