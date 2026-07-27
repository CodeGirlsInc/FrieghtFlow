import { VersioningType, INestApplication } from '@nestjs/common';

export function setupApiVersioning(app: INestApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}
