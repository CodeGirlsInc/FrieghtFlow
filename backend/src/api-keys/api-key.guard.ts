import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from './api-keys.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    const rawKey = request.headers['x-api-key'] as string | undefined;

    if (!rawKey) throw new UnauthorizedException('API key required');

    const apiKey = await this.apiKeysService.validate(rawKey);
    if (!apiKey) throw new UnauthorizedException('Invalid or expired API key');

    request.user = apiKey.user;
    return true;
  }
}
