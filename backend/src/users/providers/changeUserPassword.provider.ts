import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordDto } from '../dto/changeUserPassword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { FindOneUserByEmailProvider } from './findOneUserByEmail.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class ChangePasswordProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly findUserbyEmail: FindOneUserByEmailProvider,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async changePassword(
    userEmail: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    // if current password is the same as new password
    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    let user = await this.findUserbyEmail.findUserByEmail(userEmail);

    // check if the user's current password matches the password from the database
    const isCurrentPasswordMatch = await this.hashingProvider.comparePassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordMatch) {
      throw new UnauthorizedException('Password does not match');
    }

    // if the passwords match, go ahead to hash the new password and save it
    let passwordHashed: string;

    try {
      passwordHashed = await this.hashingProvider.hashPassword(
        changePasswordDto.newPassword,
      );

      user.password = passwordHashed;
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }

    if (!passwordHashed) {
      throw new UnauthorizedException(
        'Could not create a new password at the moment',
      );
    }

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }

    return {
      passwordChanged: true,
      message: 'New password changed successfully',
    };
  }
}
