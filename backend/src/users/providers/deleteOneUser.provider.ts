import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  deletedUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Injectable()
export class DeleteOneUserProvider {
  private readonly logger = new Logger(DeleteOneUserProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Delete a user by ID
   * @param userId - The ID of the user to delete
   * @returns Promise<DeleteUserResponse>
   */
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    try {
      this.logger.log(`Attempting to delete user with ID: ${userId}`);

      // Check if user exists
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'deletedAt'],
      });

      if (!user) {
        this.logger.warn(`User not found with ID: ${userId}`);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (user.deletedAt) {
        this.logger.warn(`User with ID ${userId} is already deleted`);
        return {
          success: false,
          message: 'User is already deleted',
        };
      }

      // Soft delete the user (set deletedAt timestamp)
      const updateResult = await this.userRepository.update(
        { id: userId },
        { 
          deletedAt: new Date(),
          isActive: false,
          updatedAt: new Date(),
        }
      );

      if (updateResult.affected === 0) {
        this.logger.error(`Failed to delete user with ID: ${userId}`);
        return {
          success: false,
          message: 'Failed to delete user',
        };
      }

      this.logger.log(`Successfully deleted user with ID: ${userId}`);

      return {
        success: true,
        message: 'User deleted successfully',
        deletedUser: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error(`Error deleting user with ID ${userId}:`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Delete a user by email
   * @param email - The email of the user to delete
   * @returns Promise<DeleteUserResponse>
   */
  async deleteUserByEmail(email: string): Promise<DeleteUserResponse> {
    try {
      this.logger.log(`Attempting to delete user with email: ${email}`);

      // Check if user exists
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'deletedAt'],
      });

      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        throw new NotFoundException(`User with email ${email} not found`);
      }

      if (user.deletedAt) {
        this.logger.warn(`User with email ${email} is already deleted`);
        return {
          success: false,
          message: 'User is already deleted',
        };
      }

      // Soft delete the user
      const updateResult = await this.userRepository.update(
        { email },
        { 
          deletedAt: new Date(),
          isActive: false,
          updatedAt: new Date(),
        }
      );

      if (updateResult.affected === 0) {
        this.logger.error(`Failed to delete user with email: ${email}`);
        return {
          success: false,
          message: 'Failed to delete user',
        };
      }

      this.logger.log(`Successfully deleted user with email: ${email}`);

      return {
        success: true,
        message: 'User deleted successfully',
        deletedUser: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error(`Error deleting user with email ${email}:`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Hard delete a user (permanently remove from database)
   * @param userId - The ID of the user to permanently delete
   * @returns Promise<DeleteUserResponse>
   */
  async hardDeleteUser(userId: string): Promise<DeleteUserResponse> {
    try {
      this.logger.log(`Attempting to hard delete user with ID: ${userId}`);

      // Check if user exists
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (!user) {
        this.logger.warn(`User not found with ID: ${userId}`);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Permanently delete the user
      const deleteResult = await this.userRepository.delete({ id: userId });

      if (deleteResult.affected === 0) {
        this.logger.error(`Failed to hard delete user with ID: ${userId}`);
        return {
          success: false,
          message: 'Failed to delete user',
        };
      }

      this.logger.log(`Successfully hard deleted user with ID: ${userId}`);

      return {
        success: true,
        message: 'User permanently deleted successfully',
        deletedUser: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error(`Error hard deleting user with ID ${userId}:`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
} 