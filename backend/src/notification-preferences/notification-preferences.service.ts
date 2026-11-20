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
    // Use upsert to avoid a race condition where two concurrent first-accesses
    // both find no row and both attempt to insert, causing a unique-constraint
    // violation on user_id.  orIgnore() maps to INSERT … ON CONFLICT DO NOTHING,
    // which is a no-op when the row already exists.
    await this.prefsRepo
      .createQueryBuilder()
      .insert()
      .into(NotificationPreferences)
      .values({ userId })
      .orIgnore()
      .execute();

    // After the upsert the row is guaranteed to exist.
    const prefs = await this.prefsRepo.findOne({ where: { userId } });
    // findOne should never return null here; the cast is a safety fallback.
    return prefs!;
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
    key: keyof Omit<
      NotificationPreferences,
      'id' | 'userId' | 'user' | 'updatedAt'
    >,
  ): Promise<boolean> {
    const prefs = await this.getOrCreate(userId);
    return prefs[key];
  }
}
