import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreferences)
    private readonly prefsRepo: Repository<NotificationPreferences>,
  ) {}

  async getOrCreate(userId: string): Promise<NotificationPreferences> {
    let prefs = await this.prefsRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.prefsRepo.create({ userId });
      prefs = await this.prefsRepo.save(prefs);
    }
    return prefs;
  }

  async update(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    const prefs = await this.getOrCreate(userId);
    Object.assign(prefs, dto);
    return this.prefsRepo.save(prefs);
  }

  async isEnabled(
    userId: string,
    key: keyof Omit<NotificationPreferences, 'id' | 'userId' | 'user' | 'updatedAt'>,
  ): Promise<boolean> {
    const prefs = await this.getOrCreate(userId);
    return prefs[key] as boolean;
  }
}
