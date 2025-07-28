import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/updateUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateOneUserProvider {
  private readonly logger = new Logger(UpdateOneUserProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateOneUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      this.logger.log(`Updating user with ID: ${userId}`);

      const user = await this.userRepository.findOne({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Prepare update data
      const updateData: Partial<User> = {
        ...updateUserDto,
        updatedAt: new Date(),
      };

      // Hash password if provided
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Remove password from updateData if not provided to avoid undefined
      if (!updateUserDto.password) {
        delete updateData.password;
      }

      // Update user
      await this.userRepository.update({ id: userId }, updateData);

      // Get updated user
      const updatedUser = await this.userRepository.findOne({
        where: { id: userId },
      });

      this.logger.log(`User updated successfully: ${userId}`);

      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 