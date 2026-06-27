import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarUploadService } from './avatar-upload.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('users/me/avatar')
export class AvatarUploadController {
  constructor(private readonly avatarUploadService: AvatarUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.avatarUploadService.uploadAvatar(user, file);
  }
}
