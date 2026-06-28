import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { parseExpiresToMs } from '../common/utils/parse-expires.util';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async login(email: string, password: string, ip?: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true, deletedAt: null },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Neispravni podaci za prijavu');
    }
    const permissions = await this.getUserPermissions(user.id);
    const tokens = await this.issueTokens(user.id, user.email);
    await this.audit.log({
      actorId: user.id,
      action: 'auth.login',
      ipAddress: ip,
    });
    return { user: { ...this.sanitizeUser(user), permissions }, ...tokens };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
      throw new UnauthorizedException('Neispravan refresh token');
    }
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(stored.userId, stored.user.email);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isActive: true, deletedAt: null },
    });
    if (!user) throw new UnauthorizedException('Korisnik nije pronađen');
    const permissions = await this.getUserPermissions(user.id);
    return { ...this.sanitizeUser(user), permissions };
  }

  async logout(refreshToken: string, userId?: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    if (userId) {
      await this.audit.log({ actorId: userId, action: 'auth.logout' });
    }
    return { success: true };
  }

  private async issueTokens(userId: string, email: string) {
    const refreshExpires = this.config.get<string>('JWT_REFRESH_EXPIRES', '7d');
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES', '15m') as `${number}m`,
      },
    );
    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + parseExpiresToMs(refreshExpires)),
      },
    });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private async getUserPermissions(userId: string): Promise<string[]> {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
    return [
      ...new Set(
        roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key)),
      ),
    ];
  }
}
