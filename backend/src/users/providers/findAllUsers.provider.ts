import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class FindAllUsersProvider {
  private readonly logger = new Logger(FindAllUsersProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async allUsers(): Promise<Partial<User>[]> {
    try {
      this.logger.log('Fetching all users');

      const users = await this.userRepository.find({
        where: { deletedAt: null },
        select: ['id', 'email', 'firstName', 'lastName', 'username', 'role', 'isActive', 'isEmailVerified', 'createdAt', 'updatedAt'],
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Found ${users.length} users`);

      return users;
    } catch (error) {
      this.logger.error(`Error fetching all users: ${error.message}`, error.stack);
      throw error;
    }
  }
} 