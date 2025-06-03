import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { CreateUserDto } from './dto/createuser.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { ChangePasswordDto } from './dto/changeUserPassword.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PaginationQueryDto } from 'src/common/pagination/dtos/paginationQuery.dto';
import { CreateManyUsersDto } from './dto/createManyUsers.dto';
import { DeleteManyUsersDto } from './dto/deleteManyUsers.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';
import { IsPublic } from 'src/auth/decorators/public.decorator';
import { CreateAdminDto } from './dto/createAdmin.dto';

@Controller('api/v1/users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // SIGN UP
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @IsPublic()
  @ApiOperation({
    summary: 'registers a new user',
    description:
      'creates an account for the user and returns user details upon success',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or invalid input',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later',
  })
  public async signup(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.signup(createUserDto);
  }

  // CHANGE USER PASSWORD ENDPOINT
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change user password',
    description: 'User successfully changes their password from this endpoint',
  })
  @ApiResponse({
    status: 200,
    description: 'User password changed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many attempts. Please try again later',
  })
  public async changeUserPassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.usersService.changeUserPassword(
      user.email,
      changePasswordDto,
    );
  }

  // FIND ALL USERS
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieves all users',
    description: 'Get all the users in the database',
  })
  @ApiResponse({
    status: 200,
    description: 'All users retrieved successfully',
  })
  public async findAllUsers(@Query() paginationQueryDto: PaginationQueryDto) {
    return await this.usersService.findAllUsers(paginationQueryDto);
  }

  // GET USER PROFILE
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieve the profile of the user',
    description: 'Get the profile of the currently logged in user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the profile of the user',
  })
  public async getUserProfile(@GetUser() user: User) {
    return await this.usersService.getUserProfile(user);
  }

  // UPDATE USER PROFILE
  @Patch('profile/update')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'update user profile',
    description: 'The endpoint for updating the profile of the logged in user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  public async updateUserProfile(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateOneUser(user.id, updateUserDto);
  }

  // FIND ONE USER
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieves a single user based on id',
    description: 'Get a single user using their id',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
  })
  public async findSingleUser(@Param('id') id: string) {
    return await this.usersService.findOneUser(id);
  }

  // UPDATE SINGLE USER
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a single user',
    description: 'Update a single user using the id of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  public async updateSingleUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateOneUser(id, updateUserDto);
  }

  // DELETE A USER
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a user',
    description: 'This endpoint deletes a user based on their provided id',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  public async deleteSingleUser(@Param('id') id: string) {
    return await this.usersService.deleteOneUser(id);
  }

  // CREATE MANY USERS
  @Post('create-multiple')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'create many users',
    description: 'admins use this endpoint to create many users',
  })
  @ApiResponse({
    status: 200,
    description: 'users created successfully',
  })
  public async createManyUsers(@Body() createManyUsersDto: CreateManyUsersDto) {
    return await this.usersService.createManyUsers(createManyUsersDto);
  }

  // DELETE MANY USERS
  @Delete('delete-multiple')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'delete many users',
    description: 'admins use this endpoint to delete many users',
  })
  @ApiResponse({
    status: 200,
    description: 'users deleted successfully',
  })
  public async deleteManyUsers(@Body() deleteManyUsersDto: DeleteManyUsersDto) {
    return await this.usersService.deleteManyUsers(deleteManyUsersDto);
  }

  // CREATE ADMIN USER
  @Post('create-admin')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new admin user',
    description: 'logged in admins use this endpoint to create other admins',
  })
  @ApiResponse({
    status: 201,
    description: 'The admin has been successfully created.',
  })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role.' })
  public async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @GetUser() user: User,
  ) {
    console.log(createAdminDto);
    return await this.usersService.createAdmin(createAdminDto, user.role);
  }
}
