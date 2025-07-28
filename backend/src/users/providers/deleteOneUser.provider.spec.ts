import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteOneUserProvider, DeleteUserResponse } from './deleteOneUser.provider';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('DeleteOneUserProvider', () => {
  let provider: DeleteOneUserProvider;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteOneUserProvider,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    provider = module.get<DeleteOneUserProvider>(DeleteOneUserProvider);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteUser', () => {
    it('should successfully delete a user by ID', async () => {
      const userId = 'test-user-id';
      const expectedResponse: DeleteUserResponse = {
        success: true,
        message: 'User deleted successfully',
        deletedUser: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await provider.deleteUser(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'deletedAt'],
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: userId },
        {
          deletedAt: expect.any(Date),
          isActive: false,
          updatedAt: expect.any(Date),
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 'non-existent-id';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(provider.deleteUser(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`)
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'deletedAt'],
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure response when user is already deleted', async () => {
      const userId = 'test-user-id';
      const deletedUser = { ...mockUser, deletedAt: new Date() };

      mockUserRepository.findOne.mockResolvedValue(deletedUser);

      const result = await provider.deleteUser(userId);

      expect(result).toEqual({
        success: false,
        message: 'User is already deleted',
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure response when update fails', async () => {
      const userId = 'test-user-id';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 0 });

      const result = await provider.deleteUser(userId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to delete user',
      });
    });
  });

  describe('deleteUserByEmail', () => {
    it('should successfully delete a user by email', async () => {
      const email = 'test@example.com';
      const expectedResponse: DeleteUserResponse = {
        success: true,
        message: 'User deleted successfully',
        deletedUser: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await provider.deleteUserByEmail(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'deletedAt'],
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { email },
        {
          deletedAt: expect.any(Date),
          isActive: false,
          updatedAt: expect.any(Date),
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when user does not exist by email', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(provider.deleteUserByEmail(email)).rejects.toThrow(
        new NotFoundException(`User with email ${email} not found`)
      );
    });
  });

  describe('hardDeleteUser', () => {
    it('should successfully hard delete a user', async () => {
      const userId = 'test-user-id';
      const expectedResponse: DeleteUserResponse = {
        success: true,
        message: 'User permanently deleted successfully',
        deletedUser: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await provider.hardDeleteUser(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName'],
      });
      expect(mockUserRepository.delete).toHaveBeenCalledWith({ id: userId });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when user does not exist for hard delete', async () => {
      const userId = 'non-existent-id';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(provider.hardDeleteUser(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`)
      );
    });

    it('should return failure response when hard delete fails', async () => {
      const userId = 'test-user-id';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await provider.hardDeleteUser(userId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to delete user',
      });
    });
  });
}); 