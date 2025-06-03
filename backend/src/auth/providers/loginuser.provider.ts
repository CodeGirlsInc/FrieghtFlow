import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from '../dtos/loginuser.dto';
import { HashingProvider } from './hashing.provider';
import { UsersService } from 'src/users/providers/users.service';
import { GenerateTokensProvider } from './generateTokens.provider';
import { RefreshTokenRepositoryOperations } from './RefreshTokenCrud.repository';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class LoginUserProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly hashingProvider: HashingProvider,

    private readonly generateTokensProvider: GenerateTokensProvider,

    private readonly refreshTokenRepositoryOperations: RefreshTokenRepositoryOperations,
  ) {}

  public async loginUser(loginUserDto: LoginUserDto, user: User, req: Request) {
    // find one user by email
    let existingUser = await this.usersService.findOneUserByEmail(
      loginUserDto.email,
    );

    console.log(existingUser);

    let isPasswordEqual: boolean = false;

    try {
      isPasswordEqual = await this.hashingProvider.comparePassword(
        loginUserDto.password,
        existingUser.password,
      );
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }

    // if password is not correct
    if (!isPasswordEqual) {
      throw new UnauthorizedException('Email/Password is not correct');
    }

    const tokens =
      await this.generateTokensProvider.generateBothTokens(existingUser);

    await this.refreshTokenRepositoryOperations.saveRefreshToken(
      user,
      tokens.refreshToken,
      req,
    );

    return tokens;
  }
}
