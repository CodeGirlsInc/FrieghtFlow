import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserCrudActivitiesProvider } from './providers/userCrud.provider';
import { AuthModule } from 'src/auth/auth.module';
import { EmailVerificationTokenProvider } from './providers/emailVerificationToken.provider';
import { GenerateRandomTokenProvider } from './providers/generateRandomToken.provider';
import { EmailModule } from 'src/email/email.module';
import { VerifyEmailProvider } from './providers/verifyEmail.provider';
import { ResendEmailVerificationProvider } from './providers/resendVerifyEmail.provider';
import { FindOneUserByEmailProvider } from './providers/findOneUserByEmail.provider';
import { FindOneUserByIdProvider } from './providers/findOneUserById.provider';
import { ResetPasswordProvider } from './providers/passwordReset.provider';
import { PasswordResetTokenProvider } from './providers/passwordResetToken.provider';
import { ChangePasswordProvider } from './providers/changeUserPassword.provider';
import { GetUserProfileProvider } from './providers/getUserProfile.provider';
import { UpdateOneUserProvider } from './providers/updateOneUser.provider';
import { FindAllUsersProvider } from './providers/findAllUsers.provider';
import { DeleteOneUserProvider } from './providers/deleteOneUser.provider';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    EmailModule,
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCrudActivitiesProvider,
    EmailVerificationTokenProvider,
    GenerateRandomTokenProvider,
    VerifyEmailProvider,
    ResendEmailVerificationProvider,
    FindOneUserByEmailProvider,
    FindOneUserByIdProvider,
    ResetPasswordProvider,
    PasswordResetTokenProvider,
    ChangePasswordProvider,
    GetUserProfileProvider,
    UpdateOneUserProvider,
    FindAllUsersProvider,
    DeleteOneUserProvider,
  ],
  exports: [UsersService],
})
export class UsersModule {}
