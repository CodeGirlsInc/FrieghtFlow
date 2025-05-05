import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { CreateUserDto } from '../dtos/createuser.dto';
import { UserRole } from 'src/auth/enums/roles.enum';

@Injectable()
export class CreateSinlgeUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async createSingleUser(createUserDto: CreateUserDto) {
    // SECTION TO CHECK FOR EXISTING USER
    let existingUser: User = null;

    try {
      //check if the user already exists using the user's email
      existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch (error) {
      //handle error if we could not connect to database
      throw new RequestTimeoutException('Error connecting to the database');
    }

    // check if user exists
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // SECTION TO CREATE NEW USER
    let newUser = this.userRepository.create(createUserDto);

    // hash the user password
    const hashedPassword = await this.hashingProvider.hashPassword(
      createUserDto.password,
    );

    // save the new user object with the hashed password
    newUser = {
      ...newUser,
      password: hashedPassword,
      role: UserRole.USER,
    };

    try {
      newUser = await this.userRepository.save(newUser);
    } catch (error) {
      // handle error if the user could not be created
      throw new RequestTimeoutException('Error connecting to the database');
    }

    return newUser;
  }
}
