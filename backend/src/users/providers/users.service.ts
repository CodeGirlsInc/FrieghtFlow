import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/createuser.dto';
import { User } from '../entities/users.entity';
import { CreateSinlgeUserProvider } from './createsingleuser.provider';
import { FindOneUserByEmailProvider } from './findOneUserByEmail.provider';
import { FindOneUserByIdProvider } from './findOneUserById.provider';
import { ChangePasswordProvider } from './changeUserPassword.provider';
import { ChangePasswordDto } from '../dtos/changeUserPassword.dto';
import { ForgotPasswordDto } from 'src/auth/dtos/forgotPassword.dto';
import { PasswordResetTokenProvider } from './setPasswordResetToken.provider';
import { ResetPasswordDto } from 'src/auth/dtos/resetPassword.dto';
import { ResetPasswordProvider } from './resetPassword.provider';
import { EmailVerificationTokenProvider } from './setEmailVerificationToken.provider';
import { MailService } from 'src/mail/mail.service';
import { VerifyEmailProvider } from './verifyEmail.provider';
import { VerifyEmailDto } from 'src/auth/dtos/verifyEmail.dto';
import { ResendEmailVerificationProvider } from './resendEmailVerification.provider';
import { FindAllUsersProvider } from './findAllUsers.provider';
import { UpdateOneUserProvider } from './updateOneUser.provider';
import { UpdateUserDto } from '../dtos/updateUser.dto';
import { DeleteOneUserProvider } from './deleteOneUser.provider';
import { PaginationQueryDto } from 'src/common/pagination/dtos/paginationQuery.dto';
import { CreateManyUsersDto } from '../dtos/createManyUsers.dto';
import { CreateManyUsersProvider } from './createManyUsers.provider';
import { DeleteManyUsersProvider } from './deleteManyUsers.provider';
import { DeleteManyUsersDto } from '../dtos/deleteManyUsers.dto';
import { GetUserProfileProvider } from './getUserProfile.provider';
import { CreateAdminProvider } from './createAdminUser.provider';
import { CreateAdminDto } from '../dtos/createAdmin.dto';
import { UserRole } from 'src/auth/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly createSinlgeUser: CreateSinlgeUserProvider,

    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    private readonly findOneUserByIdProvider: FindOneUserByIdProvider,

    private readonly changeUserPasswordProvider: ChangePasswordProvider,

    private readonly passwordResetProvider: PasswordResetTokenProvider,

    private readonly resetPasswordProvider: ResetPasswordProvider,

    private readonly emailVerificationTokenProvider: EmailVerificationTokenProvider,

    private readonly mailService: MailService,

    private readonly verifyEmailProvider: VerifyEmailProvider,

    private readonly resendEmailVerificationProvider: ResendEmailVerificationProvider,

    private readonly findAllUsersProvider: FindAllUsersProvider,

    private readonly updateOneUserProvider: UpdateOneUserProvider,

    private readonly deleteOneUserProvider: DeleteOneUserProvider,

    private readonly createManyUsersProvider: CreateManyUsersProvider,

    private readonly deleteManyUsersProviders: DeleteManyUsersProvider,

    private readonly getUserProfileProvider: GetUserProfileProvider,

    private readonly createAdminProvider: CreateAdminProvider,
  ) {}

  // CREATE A SINGLE USER
  public async signup(createUserDto: CreateUserDto) {
    const user = await this.createSinlgeUser.createSingleUser(createUserDto);

    const verificationToken =
      await this.emailVerificationTokenProvider.getEmailVerificationToken(user);

    await this.mailService.sendVerificationEmail(user, verificationToken);

    return user;
  }

  // FIND ONE USER BY EMAIL
  public async findOneUserByEmail(email: string) {
    return await this.findOneUserByEmailProvider.findUserByEmail(email);
  }

  // FIND ONE USER BY ID
  public async findOneUserById(id: string) {
    return await this.findOneUserByIdProvider.findOneUser(id);
  }

  // CHANGE USER PASSWORD
  public async changeUserPassword(
    userEmail: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    return await this.changeUserPasswordProvider.changePassword(
      userEmail,
      changePasswordDto,
    );
  }

  // FORGOT PASSWORD
  public async forgotPasswordResetToken(forgotPasswordDto: ForgotPasswordDto) {
    return await this.passwordResetProvider.setPasswordResetToken(
      forgotPasswordDto.email,
    );
  }

  // RESET PASSWORD
  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return await this.resetPasswordProvider.resetPassword(resetPasswordDto);
  }

  // VERIFY EMAIL
  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    return await this.verifyEmailProvider.verifyEmail(verifyEmailDto);
  }

  // RESEND VERIFY EMAIL
  public async resendVerifyEmail(user: User) {
    return await this.resendEmailVerificationProvider.resendEmailVerification(
      user,
    );
  }

  // FIND ALL USERS
  public async findAllUsers(paginationQueryDto: PaginationQueryDto) {
    return await this.findAllUsersProvider.allUsers(paginationQueryDto);
  }

  // FIND ONE USER
  public async findOneUser(id: string) {
    return await this.findOneUserByIdProvider.findOneUser(id);
  }

  // UPDATE SINGLE USER
  public async updateOneUser(id: string, updateUserDto: UpdateUserDto) {
    return await this.updateOneUserProvider.updateOneUser(id, updateUserDto);
  }

  // DELETE SINGLE USER
  public async deleteOneUser(id: string) {
    return await this.deleteOneUserProvider.deleteUser(id);
  }

  // CREATE MANY USERS
  public async createManyUsers(createManyUsersDto: CreateManyUsersDto) {
    return await this.createManyUsersProvider.createUsers(createManyUsersDto);
  }

  // DELETE MANY USERS
  public async deleteManyUsers(deleteManyUsersDto: DeleteManyUsersDto) {
    return await this.deleteManyUsersProviders.deleteUsers(deleteManyUsersDto);
  }

  // GET USER PROFILE
  public async getUserProfile(user: User) {
    return await this.getUserProfileProvider.getUserProfile(user);
  }

  // CREATE ADMIN USER
  public async createAdmin(
    createAdminDto: CreateAdminDto,
    creatorRole?: UserRole,
  ) {
    return await this.createAdminProvider.createAdmin(
      createAdminDto,
      creatorRole,
    );
  }
}
