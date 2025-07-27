import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class FindOneUserByIdProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find a user by their ID
   * @param id - The user ID to search for
   * @returns Promise<User> - The user entity if found
   * @throws NotFoundException - If user is not found
   * @throws RequestTimeoutException - If database connection fails
   */
  public async findOneUserById(id: string): Promise<User> {
    let user: User | null;

    try {
      user = await this.userRepository.findOne({
        where: { id },
      });
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  /**
   * Find a user by their ID without throwing exceptions
   * @param id - The user ID to search for
   * @returns Promise<User | null> - The user entity if found, null otherwise
   * @throws RequestTimeoutException - If database connection fails
   */
  public async findOneUserByIdSafe(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      return user;
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }
  }

  /**
   * Check if a user exists by their ID
   * @param id - The user ID to check
   * @returns Promise<boolean> - True if user exists, false otherwise
   * @throws RequestTimeoutException - If database connection fails
   */
  public async userExistsById(id: string): Promise<boolean> {
    try {
      const count = await this.userRepository.count({
        where: { id },
      });
      return count > 0;
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }
  }
}
