import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_ANY_KEY, PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredAny = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_ANY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length && !requiredAny?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Nedostaju dozvole');
    }
    const perms = user.permissions ?? [];
    const hasAll = !required?.length || required.every((p) => perms.includes(p));
    const hasAny = !requiredAny?.length || requiredAny.some((p) => perms.includes(p));
    if (!hasAll || !hasAny) {
      throw new ForbiddenException('Nedostaju dozvole');
    }
    return true;
  }
}
