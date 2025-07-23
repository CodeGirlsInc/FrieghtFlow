import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { NotificationPreference } from "../entities/notification-preference.entity"
import type {
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
  BulkUpdatePreferencesDto,
} from "../dto/notification-preference.dto"
import { NotificationType, NotificationChannel } from "../entities/notification.entity"

@Injectable()
export class NotificationPreferenceService {
  constructor(private preferenceRepository: Repository<NotificationPreference>) {}

  async create(createPreferenceDto: CreateNotificationPreferenceDto): Promise<NotificationPreference> {
    const preference = this.preferenceRepository.create(createPreferenceDto)
    return this.preferenceRepository.save(preference)
  }

  async findByUser(userId: string): Promise<NotificationPreference[]> {
    return this.preferenceRepository.find({
      where: { userId },
      order: { type: "ASC", channel: "ASC" },
    })
  }

  async findUserPreference(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<NotificationPreference | null> {
    return this.preferenceRepository.findOne({
      where: { userId, type, channel },
    })
  }

  async updatePreference(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    updateData: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    let preference = await this.findUserPreference(userId, type, channel)

    if (!preference) {
      preference = await this.create({
        userId,
        type,
        channel,
        ...updateData,
      })
    } else {
      Object.assign(preference, updateData)
      preference = await this.preferenceRepository.save(preference)
    }

    return preference
  }

  async bulkUpdatePreferences(bulkUpdateDto: BulkUpdatePreferencesDto): Promise<NotificationPreference[]> {
    const preferences: NotificationPreference[] = []

    for (const [typeKey, settings] of Object.entries(bulkUpdateDto.preferences)) {
      const type = typeKey as NotificationType

      for (const channel of settings.channels) {
        const preference = await this.updatePreference(bulkUpdateDto.userId, type, channel, {
          enabled: settings.enabled,
        })
        preferences.push(preference)
      }
    }

    return preferences
  }

  async isNotificationEnabled(userId: string, type: NotificationType, channel: NotificationChannel): Promise<boolean> {
    const preference = await this.findUserPreference(userId, type, channel)

    // If no preference exists, default to enabled
    return preference ? preference.enabled : true
  }

  async getEnabledChannels(userId: string, type: NotificationType): Promise<NotificationChannel[]> {
    const preferences = await this.preferenceRepository.find({
      where: { userId, type, enabled: true },
    })

    return preferences.map((pref) => pref.channel)
  }

  async setDefaultPreferences(userId: string): Promise<NotificationPreference[]> {
    const defaultPreferences = [
      // Shipment notifications
      { type: NotificationType.SHIPMENT_CREATED, channel: NotificationChannel.IN_APP, enabled: true },
      { type: NotificationType.SHIPMENT_CREATED, channel: NotificationChannel.EMAIL, enabled: true },
      { type: NotificationType.SHIPMENT_DELIVERED, channel: NotificationChannel.IN_APP, enabled: true },
      { type: NotificationType.SHIPMENT_DELIVERED, channel: NotificationChannel.EMAIL, enabled: true },
      { type: NotificationType.SHIPMENT_DELAYED, channel: NotificationChannel.IN_APP, enabled: true },
      { type: NotificationType.SHIPMENT_DELAYED, channel: NotificationChannel.EMAIL, enabled: true },
      { type: NotificationType.SHIPMENT_CANCELLED, channel: NotificationChannel.IN_APP, enabled: true },
      { type: NotificationType.SHIPMENT_CANCELLED, channel: NotificationChannel.EMAIL, enabled: false },

      // System notifications
      { type: NotificationType.SYSTEM_ALERT, channel: NotificationChannel.IN_APP, enabled: true },
      { type: NotificationType.SYSTEM_ALERT, channel: NotificationChannel.EMAIL, enabled: false },
      { type: NotificationType.USER_MENTION, channel: NotificationChannel.IN_APP, enabled: true },
      { type: NotificationType.USER_MENTION, channel: NotificationChannel.EMAIL, enabled: true },
    ]

    const preferences: NotificationPreference[] = []

    for (const defaultPref of defaultPreferences) {
      const existing = await this.findUserPreference(userId, defaultPref.type, defaultPref.channel)

      if (!existing) {
        const preference = await this.create({
          userId,
          type: defaultPref.type,
          channel: defaultPref.channel,
          enabled: defaultPref.enabled,
        })
        preferences.push(preference)
      }
    }

    return preferences
  }

  async remove(id: string): Promise<void> {
    const preference = await this.preferenceRepository.findOne({ where: { id } })

    if (!preference) {
      throw new NotFoundException(`Preference with ID ${id} not found`)
    }

    await this.preferenceRepository.remove(preference)
  }

  async getUserPreferenceSummary(userId: string): Promise<{
    totalPreferences: number
    enabledByChannel: Record<NotificationChannel, number>
    enabledByType: Record<NotificationType, number>
  }> {
    const preferences = await this.findByUser(userId)
    const enabledPreferences = preferences.filter((pref) => pref.enabled)

    const enabledByChannel = enabledPreferences.reduce(
      (acc, pref) => {
        acc[pref.channel] = (acc[pref.channel] || 0) + 1
        return acc
      },
      {} as Record<NotificationChannel, number>,
    )

    const enabledByType = enabledPreferences.reduce(
      (acc, pref) => {
        acc[pref.type] = (acc[pref.type] || 0) + 1
        return acc
      },
      {} as Record<NotificationType, number>,
    )

    return {
      totalPreferences: preferences.length,
      enabledByChannel,
      enabledByType,
    }
  }
}
