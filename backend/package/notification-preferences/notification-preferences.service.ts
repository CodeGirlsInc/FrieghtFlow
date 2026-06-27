import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationChannel,
  NotificationEventType,
  NotificationPreference,
} from './entities/notification-preference.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly repo: Repository<NotificationPreference>,
  ) {}

  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    const existing = await this.repo.find({ where: { userId } });
    if (existing.length > 0) return existing;
    return this.createDefaults(userId);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<NotificationPreference[]> {
    for (const item of dto.preferences) {
      const pref = await this.repo.findOne({
        where: { userId, eventType: item.eventType, channel: item.channel },
      });
      if (pref) {
        pref.enabled = item.enabled;
        await this.repo.save(pref);
      } else {
        await this.repo.save(this.repo.create({ userId, ...item }));
      }
    }
    return this.getPreferences(userId);
  }

  private async createDefaults(userId: string): Promise<NotificationPreference[]> {
    const defaults: NotificationPreference[] = [];
    for (const eventType of Object.values(NotificationEventType)) {
      for (const channel of Object.values(NotificationChannel)) {
        defaults.push(this.repo.create({ userId, eventType, channel, enabled: true }));
      }
    }
    return this.repo.save(defaults);
  }
}
