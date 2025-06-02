import {
  forwardRef,
  Injectable,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { FindOneUserByEmailProvider } from 'src/users/providers/findOneUserByEmail.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { GenerateRandomTokenProvider } from './generateRandomToken.provider';

@Injectable()
export class PasswordResetTokenProvider {
  constructor(
    private readonly findUserByEmail: FindOneUserByEmailProvider,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly generateRandomToken: GenerateRandomTokenProvider,
  ) {}

  public async setPasswordResetToken(email: string) {
    const user = await this.findUserByEmail.findUserByEmail(email);

    const token = this.generateRandomToken.getRandomToken();

    // hash token before saving
    const hashedToken = await this.hashingProvider.hashPassword(token);

    if (!hashedToken) {
      throw new BadRequestException('Error hashing password token');
    }

    // save the hashed token and the expiration (1 hours) to database
    (user.passwordResetToken = hashedToken),
      (user.passwordResetExpires = new Date(Date.now() + 3600000));

    await this.usersRepository.save(user);

    return {
      token,
      user,
    };
  }
}
