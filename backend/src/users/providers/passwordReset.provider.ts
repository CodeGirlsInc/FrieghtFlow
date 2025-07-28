import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { ResetPasswordDto } from 'src/auth/dto/resetPassword.dto';
import { FindOneUserByEmailProvider } from './findOneUserByEmail.provider';

@Injectable()
export class ResetPasswordProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,
  ) {}

  /**
   * Reset user password using reset token
   * @param resetPasswordDto - Contains email, reset token, and new password
   * @returns Promise<{ message: string }>
   */
  public async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, token, newPassword } = resetPasswordDto;

    // Find user by email
    const user = await this.findOneUserByEmailProvider.findUserByEmail(email);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Validate reset token
    await this.validateResetToken(user, token);

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token fields
    await this.userRepository.update(
      { id: user.id },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      }
    );

    return {
      message: 'Password has been reset successfully',
    };
  }

  /**
   * Validate password reset token
   * @param user - User entity
   * @param token - Reset token to validate
   * @throws UnauthorizedException if token is invalid or expired
   */
  private async validateResetToken(user: User, token: string): Promise<void> {
    // Check if user has a reset token
    if (!user.passwordResetToken) {
      throw new UnauthorizedException('Password reset token not found');
    }

    // Check if token has expired
    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      throw new UnauthorizedException('Password reset token has expired');
    }

    // Compare provided token with stored hashed token
    const isTokenValid = await bcrypt.compare(token, user.passwordResetToken);
    
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid password reset token');
    }
  }

  /**
   * Generate a secure random token for password reset
   * @returns string - A secure random token
   */
  public generateSecureToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash the reset token for secure storage
   * @param token - Plain text token
   * @returns Promise<string> - Hashed token
   */
  public async hashResetToken(token: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(token, saltRounds);
  }

  /**
   * Calculate expiration time for reset token (default: 1 hour)
   * @param hours - Number of hours until expiration (default: 1)
   * @returns Date - Expiration date
   */
  public calculateTokenExpiration(hours: number = 1): Date {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + hours);
    return expirationTime;
  }

  /**
   * Check if a reset token has expired
   * @param expirationDate - Token expiration date
   * @returns boolean - True if expired, false otherwise
   */
  public isTokenExpired(expirationDate: Date): boolean {
    return new Date() > expirationDate;
  }

  /**
   * Clear password reset token and expiration from user
   * @param userId - User ID
   * @returns Promise<void>
   */
  public async clearResetToken(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      {
        passwordResetToken: null,
        passwordResetExpires: null,
      }
    );
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns boolean - True if password meets requirements
   */
  public validatePasswordStrength(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}