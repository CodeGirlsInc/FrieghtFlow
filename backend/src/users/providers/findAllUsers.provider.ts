import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class FindAllUsersProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Retrieve all users from the database
   * @returns Promise<User[]> - Array of all users
   */
  public async allUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          // Exclude sensitive fields like password
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return users;
    } catch (error) {
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }

  /**
   * Retrieve all users with pagination
   * @param page - Page number (starting from 1)
   * @param limit - Number of users per page
   * @returns Promise<{ users: User[], total: number, page: number, limit: number }>
   */
  public async allUsersWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await this.userRepository.findAndCount({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        order: {
          createdAt: 'DESC',
        },
        skip,
        take: limit,
      });

      return {
        users,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve users with pagination: ${error.message}`);
    }
  }
}