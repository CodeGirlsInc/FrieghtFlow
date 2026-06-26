
import { Test, TestingModule } from '@nestjs/testing';
import { AvatarUploadController } from './avatar-upload.controller';
import { AvatarUploadService } from './avatar-upload.service';
import { User } from '../users/entities/user.entity';

describe('AvatarUploadController', () => {
  let controller: AvatarUploadController;
  let service: AvatarUploadService;

  const mockAvatarUploadService = {
    uploadAvatar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarUploadController],
      providers: [
        { provide: AvatarUploadService, useValue: mockAvatarUploadService },
      ],
    }).compile();

    controller = module.get<AvatarUploadController>(AvatarUploadController);
    service = module.get<AvatarUploadService>(AvatarUploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadAvatar', () => {
    it('should call the avatar upload service with the user and file', async () => {
      const user = { id: 'user-id' } as User;
      const file = { originalname: 'avatar.jpg' } as Express.Multer.File;
      await controller.uploadAvatar(user, file);
      expect(service.uploadAvatar).toHaveBeenCalledWith(user, file);
    });
  });
});