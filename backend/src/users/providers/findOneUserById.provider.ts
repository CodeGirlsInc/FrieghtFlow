import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class FindOneUserByIdProvider {
  private readonly logger = new Logger(FindOneUserByIdProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneUserById(id: string): Promise<User> {
    try {
      this.logger.log(`Finding user by ID: ${id}`);

      const user = await this.userRepository.findOne({
        where: { id, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error finding user by ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 