
import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AvatarUploadService {
  constructor(private readonly usersService: UsersService) {}

  async uploadAvatar(
    user: User,
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    if (!file) {
      throw new Error('No file uploaded.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.');
    }

    const maxFileSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxFileSize) {
      throw new Error('File size exceeds the 2MB limit.');
    }

    if (user.avatarUrl) {
      const oldAvatarPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        user.avatarUrl,
      );
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'avatars', fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);

    const avatarUrl = `/avatars/${fileName}`;

    await this.usersService.update(user.id, { avatarUrl });

    return { avatarUrl };
  }
}