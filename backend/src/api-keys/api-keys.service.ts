import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from './api-key.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly repo: Repository<ApiKey>,
  ) {}

  async create(
    userId: string,
    name: string,
  ): Promise<{ key: string; apiKey: ApiKey }> {
    const rawKey = `ff_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = this.repo.create({ userId, name, keyHash });
    await this.repo.save(apiKey);
    return { key: rawKey, apiKey };
  }

  async findAllForUser(userId: string): Promise<ApiKey[]> {
    return this.repo.find({ where: { userId, isActive: true } });
  }

  async revoke(userId: string, id: string): Promise<void> {
    const key = await this.repo.findOne({ where: { id, userId } });
    if (!key) throw new NotFoundException('API key not found');
    await this.repo.update(id, { isActive: false });
  }

  async validateKey(rawKey: string): Promise<ApiKey | null> {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const key = await this.repo.findOne({ where: { keyHash, isActive: true } });
    if (key) {
      await this.repo.update(key.id, { lastUsedAt: new Date() });
    }
    return key ?? null;
  }
}
