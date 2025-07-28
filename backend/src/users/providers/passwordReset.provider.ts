import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

export class ResetPasswordDto {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordProvider {
  private readonly logger = new Logger(ResetPasswordProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    try {
      this.logger.log('Attempting to reset password');

      const user = await this.userRepository.findOne({
        where: { passwordResetToken: resetPasswordDto.token },
      });

      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }

      if (user.passwordResetTokenExpires && user.passwordResetTokenExpires < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

      // Update user with new password and clear reset token
      await this.userRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetTokenExpires: null,
          updatedAt: new Date(),
        }
      );

      this.logger.log(`Password reset successfully for user: ${user.email}`);

      return user;
    } catch (error) {
      this.logger.error(`Error resetting password: ${error.message}`, error.stack);
      throw error;
    }
  }
} 