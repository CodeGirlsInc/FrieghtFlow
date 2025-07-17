import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { CreateUserDto } from '../dto/createUser.dto';
import { UserCrudActivitiesProvider } from './userCrud.provider';
import { EmailVerificationTokenProvider } from './emailVerificationToken.provider';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailProvider } from './verifyEmail.provider';
import { VerifyEmailDto } from '../dto/verifyEmail.dto';
import { User } from '../entities/user.entity';
import { ResendEmailVerificationProvider } from './resendVerifyEmail.provider';
import { FindOneUserByEmailProvider } from './findOneUserByEmail.provider';
import { FindOneUserByIdProvider } from './findOneUserById.provider';
import { PasswordResetTokenProvider } from './passwordResetToken.provider';
import { ResetPasswordProvider } from './passwordReset.provider';
import { ForgotPasswordDto } from 'src/auth/dto/forgotPassword.dto';
import { ResetPasswordDto } from 'src/auth/dto/resetPassword.dto';
import { ChangePasswordProvider } from './changeUserPassword.provider';
import { ChangePasswordDto } from 'src/auth/dto/changeUserPassword.dto';
import { GetUserProfileProvider } from './getUserProfile.provider';
import { UpdateOneUserProvider } from './updateOneUser.provider';
import { FindAllUsersProvider } from './findAllUsers.provider';
import { DeleteOneUserProvider } from './deleteOneUser.provider';

@Injectable()
export class UsersService {
  constructor(
    private readonly userCrudActivities: UserCrudActivitiesProvider,

    private readonly emailVerificationTokenProvider: EmailVerificationTokenProvider,

    private readonly emailService: EmailService,

    private readonly verifyEmailProvider: VerifyEmailProvider,

    private readonly resendVerifyEmailProvider: ResendEmailVerificationProvider,

    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    private readonly findOneUserByIdProvider: FindOneUserByIdProvider,

    private readonly passwordResetProvider: PasswordResetTokenProvider,

    private readonly resetPasswordProvider: ResetPasswordProvider,

    private readonly changePasswordProvider: ChangePasswordProvider,

    private readonly getUserProfileProvider: GetUserProfileProvider,

    private readonly updateUserProvider: UpdateOneUserProvider,

    private readonly findAllUsersProvider: FindAllUsersProvider,

    private readonly deleteOneUserProvider: DeleteOneUserProvider,
  ) {}

  // FIND ONE USER BY EMAIL
  public async findOneUserByEmail(email: string) {
    return await this.findOneUserByEmailProvider.findUserByEmail(email);
  }

  // FIND ONE USER BY ID
  public async findOneUserById(id: string) {
    return await this.findOneUserByIdProvider.findOneUserById(id);
  }

  // CREATE A SINGLE USER
  public async createSingleUser(createUserDto: CreateUserDto) {
    const user = await this.userCrudActivities.createSingleUser(createUserDto);

    const emailVerificationToken =
      await this.emailVerificationTokenProvider.getEmailVerificationToken(user);

    await this.emailService.sendVerificationEmail(user, emailVerificationToken);

    return user;
  }

  // VERIFY USER EMAIL
  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    return await this.verifyEmailProvider.verifyEmail(verifyEmailDto);
  }

  // RESEND VERIFY USER EMAIL
  public async resendVerifyEmail(user: User) {
    return await this.resendVerifyEmailProvider.resendEmailVerification(user);
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

  // CHANGE PASSWORD
  public async changePassword(
    userEmail: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    return await this.changePasswordProvider.changePassword(
      userEmail,
      changePasswordDto,
    );
  }

  // GET USER PROFILE
  public async userProfile(user: User) {
    return await this.getUserProfileProvider.getUserProfile(user);
  }

  // UPDATE USER
  public async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    return await this.updateUserProvider.updateOneUser(userId, updateUserDto);
  }

  // GET ALL USERS
  public async getAllUsers() {
    return await this.findAllUsersProvider.allUsers();
  }

  // GET SINGLE USER
  public async getSingleUser(userId: string) {
    return await this.findOneUserByIdProvider.findOneUserById(userId);
  }

  // DELETE A SINGLE USER - ADMIN
  public async deleteSingleUser(userId: string) {
    return await this.deleteOneUserProvider.deleteUser(userId);
  }
}
