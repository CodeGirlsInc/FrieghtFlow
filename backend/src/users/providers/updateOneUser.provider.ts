import {
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { FindOneUserByIdProvider } from './findOneUserById.provider';

@Injectable()
export class UpdateOneUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly hashingProvider: HashingProvider,

    private readonly findOneUserByIdProvider: FindOneUserByIdProvider,
  ) {}

  public async updateOneUser(id: string, updateUserDto: UpdateUserDto) {
    // check if user exists
    const user = await this.findOneUserByIdProvider.findOneUser(id);

    // if user is updating their password, hash it
    if (updateUserDto.password) {
      try {
        updateUserDto.password = await this.hashingProvider.hashPassword(
          updateUserDto.password,
        );
      } catch (error) {
        throw new RequestTimeoutException('Error hashing new password');
      }
    }

    // update the user object with the updated details
    Object.assign(user, updateUserDto);

    // save the updated details to the database
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save due to server error',
      );
    }

    return {
      status: true,
      message: 'User updated sucessfully',
      user: {
        user,
      },
    };
  }
}
