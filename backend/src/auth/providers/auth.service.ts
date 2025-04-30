import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { LoginUserDto } from '../dtos/loginuser.dto';
import { LoginUserProvider } from './loginuser.provider';
import { RefreshTokenDto } from '../dtos/refreshtoken.dto';
import { User } from 'src/users/entities/users.entity';
import { Request } from 'express';
import { ValidateUserProvider } from './validateUser.provider';
import { RefreshTokensProvider } from './refreshTokens.provider';
import { RefreshTokenRepositoryOperations } from './RefreshTokenCrud.repository';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/providers/users.service';
import { ForgotPasswordDto } from '../dtos/forgotPassword.dto';
import { ResetPasswordDto } from '../dtos/resetPassword.dto';
import { VerifyEmailDto } from '../dtos/verifyEmail.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly loginUserProvider: LoginUserProvider,

    private readonly validateUserProvider: ValidateUserProvider,

    private readonly refreshTokensProvider: RefreshTokensProvider,

    private readonly refreshTokenRepositoryOperations: RefreshTokenRepositoryOperations,

    private readonly mailService: MailService,
  ) {}

  //validate user for passport
  public async validateUser(email: string, password: string) {
    return await this.validateUserProvider.validateUser(email, password);
  }

  // login
  public async login(loginUserDto: LoginUserDto, user: User, req: Request) {
    console.log('USER', user);
    console.log('REQUEST', req);
    console.log(loginUserDto);
    return await this.loginUserProvider.loginUser(loginUserDto, user, req);
  }

  // refresh token
  public async refreshToken(
    refreshTokenDto: RefreshTokenDto,
    userId: string,
    req: Request,
  ) {
    return await this.refreshTokensProvider.refreshTokens(
      userId,
      refreshTokenDto.refreshToken,
      req,
    );
  }

  // log out
  public async logout(userId: string, refreshToken: string) {
    return await this.refreshTokenRepositoryOperations.revokeSingleRefreshToken(
      userId,
      refreshToken,
    );
  }

  // log out all sessions/devices
  public async logoutAllSessions(userId: string) {
    return await this.refreshTokenRepositoryOperations.revokeAllRefreshTokens(
      userId,
    );
  }

  // forgot password email with token
  public async forgotPasswordEmailAndToken(
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    try {
      const { token, user } =
        await this.usersService.forgotPasswordResetToken(forgotPasswordDto);

      await this.mailService.sendPasswordResetEmail(user, token);
    } catch (error) {
      throw new BadRequestException('Error sending password reset email');
    }
  }

  // reset password
  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return await this.usersService.resetPassword(resetPasswordDto);
  }

  // verify email
  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    return await this.usersService.verifyEmail(verifyEmailDto);
  }

  // resend verify email
  public async resendVerifyEmail(user: User) {
    return await this.usersService.resendVerifyEmail(user);
  }
}
