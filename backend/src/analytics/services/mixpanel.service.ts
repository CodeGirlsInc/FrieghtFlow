import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { TrackEventDto } from "../dto/analytics.dto"

@Injectable()
export class MixpanelService {
  private readonly mixpanelToken: string
  private readonly mixpanelApiUrl = "https://api.mixpanel.com/track"

  constructor(private readonly configService: ConfigService) {
    this.mixpanelToken = this.configService.get("MIXPANEL_TOKEN")
  }

  async track(eventData: TrackEventDto): Promise<void> {
    if (!this.mixpanelToken) {
      console.warn("Mixpanel token not configured, skipping event tracking")
      return
    }

    try {
      const payload = {
        event: eventData.eventType,
        properties: {
          token: this.mixpanelToken,
          distinct_id: eventData.userId || eventData.sessionId,
          time: Date.now(),
          ...eventData.properties,
          ...eventData.metadata,
        },
      }

      const encodedData = Buffer.from(JSON.stringify(payload)).toString("base64")

      await fetch(`${this.mixpanelApiUrl}?data=${encodedData}`, {
        method: "GET",
      })
    } catch (error) {
      console.error("Failed to send event to Mixpanel:", error)
    }
  }

  async trackBatch(events: TrackEventDto[]): Promise<void> {
    if (!this.mixpanelToken || events.length === 0) {
      return
    }

    try {
      const payload = events.map((eventData) => ({
        event: eventData.eventType,
        properties: {
          token: this.mixpanelToken,
          distinct_id: eventData.userId || eventData.sessionId,
          time: Date.now(),
          ...eventData.properties,
          ...eventData.metadata,
        },
      }))

      const encodedData = Buffer.from(JSON.stringify(payload)).toString("base64")

      await fetch(`${this.mixpanelApiUrl}?data=${encodedData}`, {
        method: "GET",
      })
    } catch (error) {
      console.error("Failed to send batch events to Mixpanel:", error)
    }
  }
}
