import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserCrudActivitiesProvider } from './userCrud.provider';
import { EmailVerificationTokenProvider } from './emailVerificationToken.provider';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailProvider } from './verifyEmail.provider';
import { ResendEmailVerificationProvider } from './resendVerifyEmail.provider';
import { FindOneUserByEmailProvider } from './findOneUserByEmail.provider';
import { FindOneUserByIdProvider } from './findOneUserById.provider';
import { PasswordResetTokenProvider } from './passwordResetToken.provider';
import { ResetPasswordProvider } from './passwordReset.provider';
import { ChangePasswordProvider } from './changeUserPassword.provider';
import { GetUserProfileProvider } from './getUserProfile.provider';
import { UpdateOneUserProvider } from './updateOneUser.provider';
import { FindAllUsersProvider } from './findAllUsers.provider';
import { DeleteOneUserProvider } from './deleteOneUser.provider';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = { id: 'user-1', email: 'test@example.com' };

  const createMock = (returnValue: any) => ({
    createSingleUser: jest.fn().mockResolvedValue(returnValue),
    findUserByEmail: jest.fn().mockResolvedValue(returnValue),
    findOneUserById: jest.fn().mockResolvedValue(returnValue),
    setPasswordResetToken: jest.fn().mockResolvedValue(returnValue),
    resetPassword: jest.fn().mockResolvedValue(returnValue),
    changePassword: jest.fn().mockResolvedValue(returnValue),
    getUserProfile: jest.fn().mockResolvedValue(returnValue),
    updateOneUser: jest.fn().mockResolvedValue(returnValue),
    allUsers: jest.fn().mockResolvedValue([returnValue]),
    deleteUser: jest.fn().mockResolvedValue(returnValue),
    getEmailVerificationToken: jest.fn().mockResolvedValue('email-token'),
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    verifyEmail: jest.fn().mockResolvedValue({ verified: true }),
    resendEmailVerification: jest.fn().mockResolvedValue({ resent: true }),
  });

  const userCrudMock = createMock(mockUser);
  const emailTokenMock = createMock('email-token');
  const emailServiceMock = createMock(undefined);
  const verifyEmailMock = createMock({ verified: true });
  const resendEmailMock = createMock({ resent: true });
  const findByEmailMock = createMock(mockUser);
  const findByIdMock = createMock(mockUser);
  const passwordResetMock = createMock({ token: 'reset-token' });
  const resetPasswordMock = createMock({ success: true });
  const changePasswordMock = createMock({ changed: true });
  const userProfileMock = createMock({ profile: 'profile-info' });
  const updateUserMock = createMock({ updated: true });
  const allUsersMock = createMock(mockUser);
  const deleteUserMock = createMock({ deleted: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserCrudActivitiesProvider, useValue: userCrudMock },
        { provide: EmailVerificationTokenProvider, useValue: emailTokenMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: VerifyEmailProvider, useValue: verifyEmailMock },
        { provide: ResendEmailVerificationProvider, useValue: resendEmailMock },
        { provide: FindOneUserByEmailProvider, useValue: findByEmailMock },
        { provide: FindOneUserByIdProvider, useValue: findByIdMock },
        { provide: PasswordResetTokenProvider, useValue: passwordResetMock },
        { provide: ResetPasswordProvider, useValue: resetPasswordMock },
        { provide: ChangePasswordProvider, useValue: changePasswordMock },
        { provide: GetUserProfileProvider, useValue: userProfileMock },
        { provide: UpdateOneUserProvider, useValue: updateUserMock },
        { provide: FindAllUsersProvider, useValue: allUsersMock },
        { provide: DeleteOneUserProvider, useValue: deleteUserMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user and send email verification', async () => {
    const dto = { email: 'test@example.com', password: '123456' };
    const result = await service.createSingleUser(dto as any);
    expect(result).toEqual(mockUser);
    expect(emailTokenMock.getEmailVerificationToken).toHaveBeenCalledWith(
      mockUser,
    );
    expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalled();
  });

  it('should find user by email', async () => {
    const result = await service.findOneUserByEmail('test@example.com');
    expect(result).toEqual(mockUser);
  });

  it('should find user by id', async () => {
    const result = await service.findOneUserById('user-1');
    expect(result).toEqual(mockUser);
  });

  it('should verify user email', async () => {
    const result = await service.verifyEmail({ token: 'abc' } as any);
    expect(result).toEqual({ verified: true });
  });

  it('should resend email verification', async () => {
    const result = await service.resendVerifyEmail(mockUser as any);
    expect(result).toEqual({ resent: true });
  });

  it('should set password reset token', async () => {
    const result = await service.forgotPasswordResetToken({
      email: 'test@example.com',
    } as any);
    expect(result).toEqual({ token: 'reset-token' });
  });

  it('should reset password', async () => {
    const result = await service.resetPassword({
      token: 'abc',
      password: 'newpass',
    } as any);
    expect(result).toEqual({ success: true });
  });

  it('should change password', async () => {
    const result = await service.changePassword('test@example.com', {
      oldPassword: 'old',
      newPassword: 'new',
    } as any);
    expect(result).toEqual({ changed: true });
  });

  it('should get user profile', async () => {
    const result = await service.userProfile(mockUser as any);
    expect(result).toEqual({ profile: 'profile-info' });
  });

  it('should update user', async () => {
    const result = await service.updateUser('user-1', {
      name: 'Updated Name',
    } as any);
    expect(result).toEqual({ updated: true });
  });

  it('should return all users', async () => {
    const result = await service.getAllUsers();
    expect(result).toEqual([mockUser]);
  });

  it('should return a single user by id', async () => {
    const result = await service.getSingleUser('user-1');
    expect(result).toEqual(mockUser);
  });

  it('should delete a user', async () => {
    const result = await service.deleteSingleUser('user-1');
    expect(result).toEqual({ deleted: true });
  });
});
