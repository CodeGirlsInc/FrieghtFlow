import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

function extractCookie(request: Request, name: string): string | null {
  // If cookie-parser is present, use parsed cookies
  const cookies = request?.cookies as Record<string, string> | undefined;
  if (cookies?.[name]) {
    return cookies[name];
  }
  // Fallback: parse raw Cookie header
  const cookieHeader = request?.headers?.['cookie'];
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

/**
 * Prefer an explicit Authorization Bearer token; use the auth_token cookie
 * only when no Bearer token was supplied.
 */
export function extractJwtFromRequest(request: Request): string | null {
  const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
  return bearerToken ?? extractCookie(request, 'auth_token');
}

/** How long a successful user lookup is reused, in milliseconds. */
const USER_CACHE_TTL_MS = Number(process.env.JWT_USER_CACHE_TTL_MS ?? 15_000);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly userCache = new Map<
    string,
    { user: User; expiresAt: number }
  >();

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: extractJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  /** Drops the cached lookup so a deactivation takes effect immediately. */
  invalidateUser(userId: string): void {
    this.userCache.delete(userId);
  }

  async validate(payload: JwtPayload) {
    const now = Date.now();
    const cached = this.userCache.get(payload.sub);
    if (cached && cached.expiresAt > now) {
      return cached.user;
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      this.userCache.delete(payload.sub);
      throw new UnauthorizedException('User is not active or does not exist');
    }
    if (USER_CACHE_TTL_MS > 0) {
      this.userCache.set(payload.sub, {
        user,
        expiresAt: now + USER_CACHE_TTL_MS,
      });
    }
    return user;
  }
}
