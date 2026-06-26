
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarUploadService } from './avatar-upload.service';

@Controller('users/me/avatar')
export class AvatarUploadController {
  constructor(private readonly avatarUploadService: AvatarUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return await this.avatarUploadService.uploadAvatar(file);
  }
}