import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('api/v1/users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET USER PROFILE - USER
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get logged-in user profile' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched user profile',
  })
  public async getUserProfile(@GetUser() user: User) {
    return await this.usersService.userProfile(user);
  }

  // UPDATE USER OWN PROFILE - USER
  @Patch('me/update')
  @ApiOperation({ summary: 'Update logged-in user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  public async updateUserProfile(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(user.id, updateUserDto);
  }

  // DELETE USER OWN ACCOUNT - USER
  @Delete('me/delete')
  @ApiOperation({ summary: 'Delete logged-in user account' })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
  })
  public async deleteUserAccount(@GetUser() user: User) {
    return await this.usersService.deleteSingleUser(user.id);
  }

  // GET ALL USERS - ADMIN
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all users returned successfully',
  })
  public async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  // GET SINGLE USER - ADMIN
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a single user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Single user data returned successfully',
  })
  public async getSingleUser(@Param('id') userId: string) {
    return await this.usersService.getSingleUser(userId);
  }

  // DELETE SINGLE USER - ADMIN
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a single user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  public async deleteSingleUser(@Param('id') userId: string) {
    return await this.usersService.deleteSingleUser(userId);
  }
}