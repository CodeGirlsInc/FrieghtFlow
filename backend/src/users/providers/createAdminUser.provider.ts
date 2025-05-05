import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAdminDto } from '../dtos/createAdmin.dto';
import { UserRole } from 'src/auth/enums/roles.enum';
import { FindOneUserByEmailProvider } from './findOneUserByEmail.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CreateAdminProvider {
  constructor(
    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    private readonly hashingProvider: HashingProvider,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async createAdmin(
    createAdminDto: CreateAdminDto,
    creatorRole?: UserRole,
  ) {
    // check if the person that wants to create an admin is actually an admin
    if (creatorRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only an admin is allowed to create another admin',
      );
    }

    // check if the admin user we want to create exists before
    const existingUser = await this.findOneUserByEmailProvider.findUserByEmail(
      createAdminDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // hash the user password
    let hashedPassword: string;

    try {
      hashedPassword = await this.hashingProvider.hashPassword(
        createAdminDto.password,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error hashing admin user password',
      );
    }

    let admin: User;

    // create and save the admin user
    admin = this.usersRepository.create({
      ...createAdminDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    try {
      admin = await this.usersRepository.save(admin);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save admin due to server error failure',
      );
    }

    return {
      status: true,
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    };
  }
}
