import { Injectable, NestMiddleware } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExtendedError } from 'socket.io/dist/namespace';

@Injectable()
export class WsAuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  use(socket: Socket, next: (err?: ExtendedError) => void) {
    try {
      const token = this.extractToken(socket);

      if (!token) {
        return next(new Error('No token provided'));
      }

      const secret = this.configService.get<string>('JWT_SECRET') || 'secret';
      this.jwtService
        .verifyAsync(token, { secret })
        .then((payload) => {
          socket.data.user = payload;
          next();
        })
        .catch((error) => {
          next(new Error('Invalid token'));
        });
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  }

  private extractToken(socket: Socket): string | undefined {
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const token = socket.handshake.query.token as string;
    if (token) {
      return token;
    }

    return undefined;
  }
}

