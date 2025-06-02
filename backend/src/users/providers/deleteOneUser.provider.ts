import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { FindOneUserByIdProvider } from './findOneUserById.provider';

@Injectable()
export class DeleteOneUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly findOneUserByIdProvider: FindOneUserByIdProvider,
  ) {}

  public async deleteUser(id: string) {
    const user = await this.findOneUserByIdProvider.findOneUser(id);

    try {
      await this.usersRepository.remove(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete user due to server error',
      );
    }

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
