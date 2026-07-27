import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

class UpdateMeDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: 'GABCDE...XYZ' })
  @IsOptional()
  @IsString()
  walletAddress?: string;
}

class OnboardingStatus {
  @ApiProperty()
  profileComplete: boolean;

  @ApiProperty()
  addressAdded: boolean;

  @ApiProperty()
  walletLinked: boolean;

  @ApiProperty()
  firstShipmentCreated: boolean;
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  getMe(@CurrentUser() user: User) {
    const { passwordHash: _ph, refreshToken: _rt, ...safeUser } = user;
    return safeUser;
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update own profile (name, wallet — not role or email)',
  })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateMeDto) {
    const updated = await this.usersService.update(user.id, dto);
    const { passwordHash: _ph, refreshToken: _rt, ...safeUser } = updated;
    return safeUser;
  }

  @Get('me/onboarding')
  @ApiOperation({ summary: 'Get computed onboarding status' })
  @ApiResponse({ status: 200, description: 'Onboarding status' })
  async getOnboarding(@CurrentUser() user: User): Promise<OnboardingStatus> {
    const [hasAddress, hasWallet, hasShipment] = await Promise.all([
      this.usersService.hasAddress(user.id),
      Promise.resolve(!!user.walletAddress),
      this.usersService.hasShipment(user.id),
    ]);

    return {
      profileComplete: !!(user.firstName && user.lastName),
      addressAdded: hasAddress,
      walletLinked: hasWallet,
      firstShipmentCreated: hasShipment,
    };
  }
}
