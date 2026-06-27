import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from '../api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { apiKeyUserId?: string }>();
    const header = request.headers['x-api-key'];
    const rawKey = Array.isArray(header) ? header[0] : header;

    if (!rawKey) throw new UnauthorizedException('API key required');

    const apiKey = await this.apiKeysService.validateKey(rawKey);
    if (!apiKey) throw new UnauthorizedException('Invalid or inactive API key');

    request.apiKeyUserId = apiKey.userId;
    return true;
  }
}
