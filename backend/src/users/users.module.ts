import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CreateSinlgeUserProvider } from './providers/createsingleuser.provider';
import { FindOneUserByEmailProvider } from './providers/findOneUserByEmail.provider';
import { FindOneUserByIdProvider } from './providers/findOneUserById.provider';
import { ChangePasswordProvider } from './providers/changeUserPassword.provider';
import { PasswordResetTokenProvider } from './providers/setPasswordResetToken.provider';
import { ResetPasswordProvider } from './providers/resetPassword.provider';
import { GenerateRandomTokenProvider } from './providers/generateRandomToken.provider';
import { EmailVerificationTokenProvider } from './providers/setEmailVerificationToken.provider';
import { MailModule } from 'src/mail/mail.module';
import { VerifyEmailProvider } from './providers/verifyEmail.provider';
import { ResendEmailVerificationProvider } from './providers/resendEmailVerification.provider';
import { FindAllUsersProvider } from './providers/findAllUsers.provider';
import { UpdateOneUserProvider } from './providers/updateOneUser.provider';
import { DeleteOneUserProvider } from './providers/deleteOneUser.provider';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { CreateManyUsersProvider } from './providers/createManyUsers.provider';
import { DeleteManyUsersProvider } from './providers/deleteManyUsers.provider';
import { GetUserProfileProvider } from './providers/getUserProfile.provider';
import { CreateAdminProvider } from './providers/createAdminUser.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    MailModule,
    PaginationModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateSinlgeUserProvider,
    FindOneUserByEmailProvider,
    FindOneUserByIdProvider,
    ChangePasswordProvider,
    PasswordResetTokenProvider,
    ResetPasswordProvider,
    GenerateRandomTokenProvider,
    EmailVerificationTokenProvider,
    VerifyEmailProvider,
    ResendEmailVerificationProvider,
    FindAllUsersProvider,
    UpdateOneUserProvider,
    DeleteOneUserProvider,
    CreateManyUsersProvider,
    DeleteManyUsersProvider,
    GetUserProfileProvider,
    CreateAdminProvider,
  ],
  exports: [UsersService],
})
export class UsersModule {}
