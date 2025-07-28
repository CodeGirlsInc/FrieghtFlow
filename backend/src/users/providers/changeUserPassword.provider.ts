import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordProvider {
  private readonly logger = new Logger(ChangePasswordProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async changePassword(userEmail: string, changePasswordDto: ChangePasswordDto): Promise<User> {
    try {
      this.logger.log(`Attempting to change password for user: ${userEmail}`);

      const user = await this.userRepository.findOne({
        where: { email: userEmail, deletedAt: null },
        select: ['id', 'email', 'password'],
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

      // Update user with new password
      await this.userRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
          updatedAt: new Date(),
        }
      );

      this.logger.log(`Password changed successfully for user: ${userEmail}`);

      return user;
    } catch (error) {
      this.logger.error(`Error changing password: ${error.message}`, error.stack);
      throw error;
    }
  }
} 