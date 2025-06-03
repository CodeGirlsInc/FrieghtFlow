import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class ValidateUserProvider {
  constructor(
    private readonly hashingProvider: HashingProvider,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  public async validateUser(email: string, userPassword: string) {
    let user = await this.usersService.findOneUserByEmail(email);

    let isPasswordEqual: boolean = false;

    try {
      isPasswordEqual = await this.hashingProvider.comparePassword(
        userPassword,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException('Error connecting...');
    }

    if (!user) {
      throw new NotFoundException('Email/Password is not correct');
    }

    const { password, ...result } = user;

    return result;
  }
}
