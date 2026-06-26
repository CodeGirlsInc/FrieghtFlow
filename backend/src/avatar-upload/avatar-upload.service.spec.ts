
import { Test, TestingModule } from '@nestjs/testing';
import { AvatarUploadService } from './avatar-upload.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('AvatarUploadService', () => {
  let service: AvatarUploadService;
  let usersService: UsersService;

  const mockUsersService = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarUploadService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AvatarUploadService>(AvatarUploadService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadAvatar', () => {
    const user = { id: 'user-id', avatarUrl: null } as User;
    const file = {
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    it('should upload a valid avatar', async () => {
      const result = await service.uploadAvatar(user, file);
      expect(result.avatarUrl).toBe('/avatars/test-uuid.jpg');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        file.buffer,
      );
      expect(usersService.update).toHaveBeenCalledWith(user.id, {
        avatarUrl: '/avatars/test-uuid.jpg',
      });
    });

    it('should throw an error for invalid mime type', async () => {
      const invalidFile = { ...file, mimetype: 'image/gif' };
      await expect(service.uploadAvatar(user, invalidFile)).rejects.toThrow(
        'Invalid file type. Only JPEG, PNG, and WEBP are allowed.',
      );
    });

    it('should throw an error for oversized file', async () => {
      const oversizedFile = { ...file, size: 3 * 1024 * 1024 };
      await expect(service.uploadAvatar(user, oversizedFile)).rejects.toThrow(
        'File size exceeds the 2MB limit.',
      );
    });

    it('should delete the old avatar if it exists', async () => {
      const userWithAvatar = {
        id: 'user-id',
        avatarUrl: '/avatars/old-avatar.jpg',
      } as User;
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      await service.uploadAvatar(userWithAvatar, file);
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('old-avatar.jpg'));
    });
  });
});