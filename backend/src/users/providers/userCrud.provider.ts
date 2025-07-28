import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserCrudActivitiesProvider {
  private readonly logger = new Logger(UserCrudActivitiesProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createSingleUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Hash the password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create user entity
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      // Save to database
      const savedUser = await this.userRepository.save(user);

      this.logger.log(`Successfully created user with ID: ${savedUser.id}`);

      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }
} 