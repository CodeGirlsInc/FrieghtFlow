import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class ChangeUserPasswordProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'password'] });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(userId, { password: hashedNewPassword });
  }
}
