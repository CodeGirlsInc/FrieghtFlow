
import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AvatarUploadService {
  async uploadAvatar(file: Express.Multer.File): Promise<{ avatarUrl: string }> {
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

    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'avatars', fileName);

    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);

    const avatarUrl = `/uploads/avatars/${fileName}`;

    return { avatarUrl };
  }
}