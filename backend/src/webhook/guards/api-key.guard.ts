import { Injectable, type CanActivate, type ExecutionContext, Logger, UnauthorizedException } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { Request } from "express"

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name)

  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const apiKey = request.headers["x-api-key"] as string
    const configuredApiKey = this.configService.get<string>("API_KEY")

    if (!apiKey || !configuredApiKey || apiKey !== configuredApiKey) {
      this.logger.warn("Invalid API key")
      throw new UnauthorizedException("Invalid API key")
    }

    return true
  }
}
