import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryHealthIndicator {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = (await cloudinary.api.ping()) as { status: string };
      if (result && result.status === 'ok') {
        return {
          [key]: {
            status: 'up',
          },
        };
      }
      return {
        [key]: {
          status: 'down',
          message: 'Cloudinary ping returned unexpected status',
        },
      };
    } catch (error) {
      return {
        [key]: {
          status: 'down',
          message:
            error instanceof Error
              ? error.message
              : 'Cloudinary connection failed',
        },
      };
    }
  }
}
