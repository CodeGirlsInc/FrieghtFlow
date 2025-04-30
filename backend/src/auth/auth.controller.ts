import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './providers/auth.service';
import { LoginUserDto } from './dtos/loginuser.dto';
import { RefreshTokenDto } from './dtos/refreshtoken.dto';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { GetUser } from './decorators/getUser.decorator';
import { User } from 'src/users/entities/users.entity';
import { Request } from 'express';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { ForgotPasswordDto } from './dtos/forgotPassword.dto';
import { ResetPasswordDto } from './dtos/resetPassword.dto';
import { VerifyEmailDto } from './dtos/verifyEmail.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { IsPublic } from './decorators/public.decorator';

@UseGuards(ThrottlerGuard)
@Controller('api/v1/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // LOGIN ROUTE
  @IsPublic()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @ApiOperation({
    summary: 'verifies and logs in a user',
    description:
      'Checks user credentials and returns both the access token and refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully logged in',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation errors',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts, please try again later',
  })
  public async login(
    @Body() loginUserDto: LoginUserDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    return await this.authService.login(loginUserDto, user, req);
  }

  // REFRESH TOKEN ROUTE
  @IsPublic()
  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @ApiOperation({
    summary: 'Route to get an access token',
    description: 'An access token is successfully gotten upon success',
  })
  @ApiResponse({
    status: 200,
    description: 'Refresh token successfully gotten',
  })
  @ApiResponse({
    status: 400,
    description: 'bad request',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many refresh attempts. Please try again later',
  })
  public async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    console.log('USER', user.id);
    console.log('USER', user.token);
    console.log(refreshTokenDto);
    return await this.authService.refreshToken(refreshTokenDto, user.id, req);
  }

  // LOG OUT SINGLE SESSION/ONE DEVICE
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log out user',
    description: 'logs out user from a single device/session',
  })
  @ApiResponse({
    example: 200,
    description: 'user logged out successfully',
  })
  public async logout(
    @GetUser() user: User,
    @Body() body: { refreshToken: string },
  ) {
    return await this.authService.logout(user.id, body.refreshToken);
  }

  //LOGOUT ALL SESSIONS/DEVIES
  @Post('logout-all-sessions')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'log out of all devices/sessions',
    description:
      'This ensures the user is logged out successfully from all sessions/devices',
  })
  @ApiResponse({
    example: 200,
    description: 'User logged out of all sessions successfully',
  })
  public async logoutAllSessions(@GetUser() user: User) {
    return this.authService.logoutAllSessions(user.id);
  }

  // FORGOT PASSWORD
  @IsPublic()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000 * 15, // 3 requests per 15 mins
    },
  })
  @ApiOperation({
    summary: 'Request a password reset',
    description:
      'User inputs their email to get a password reset email sent to them',
  })
  @ApiResponse({
    status: 200,
    description:
      'Password reset email has been sent successfully if email exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later',
  })
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPasswordEmailAndToken(forgotPasswordDto);
  }

  // RESET PASSWORD
  @IsPublic()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000 * 60, // 5 requests per hour
    },
  })
  @ApiOperation({
    summary: 'user password reset',
    description: 'User enters a new password to reset their password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid reset token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many attempts. Please try again later',
  })
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // VERIFY EMAIL
  @IsPublic()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @ApiOperation({
    summary: 'Verify user email',
    description: 'Verify the user email with their token and id',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many verification attempts. Please try again later',
  })
  public async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  // RESEND VERIFY EMAIL
  @Post('resend-email-verification')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000 * 15, // 3 requests per 15 mins
    },
  })
  @ApiOperation({
    summary: 'Resend the verification email',
    description: 'Resend the email verification to the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later',
  })
  public async resendVerifyEmail(@GetUser() user: User) {
    return this.authService.resendVerifyEmail(user);
  }
}
