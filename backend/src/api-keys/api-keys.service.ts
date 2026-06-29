import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async create(
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ key: string; apiKey: ApiKey }> {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const prefix = rawKey.substring(0, 8);
    const keyHash = await bcrypt.hash(rawKey, 12);

    const apiKey = this.apiKeyRepo.create({
      userId,
      name: dto.name,
      keyHash,
      prefix,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      lastUsedAt: null,
    });

    const saved = await this.apiKeyRepo.save(apiKey);
    return { key: rawKey, apiKey: saved };
  }

  findAll(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      where: { userId },
      select: ['id', 'name', 'prefix', 'expiresAt', 'lastUsedAt', 'createdAt'],
    });
  }

  async revoke(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const key = await this.apiKeyRepo.findOne({ where: { id } });
    if (!key) throw new NotFoundException('API key not found');
    if (!isAdmin && key.userId !== userId)
      throw new ForbiddenException('Not your API key');
    await this.apiKeyRepo.delete(id);
  }

  async validate(rawKey: string): Promise<ApiKey | null> {
    const prefix = rawKey.substring(0, 8);
    const candidates = await this.apiKeyRepo.find({
      where: { prefix },
      relations: ['user'],
    });

    for (const apiKey of candidates) {
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) continue;
      const isValid = await bcrypt.compare(rawKey, apiKey.keyHash);
      if (isValid) {
        await this.apiKeyRepo.update(apiKey.id, { lastUsedAt: new Date() });
        return apiKey;
      }
    }
    return null;
  }
}
