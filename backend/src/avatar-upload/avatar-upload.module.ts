import { Module } from '@nestjs/common';
import { AvatarUploadController } from './avatar-upload.controller';
import { AvatarUploadService } from './avatar-upload.service';

@Module({
  controllers: [AvatarUploadController],
  providers: [AvatarUploadService],
})
export class AvatarUploadModule {}
