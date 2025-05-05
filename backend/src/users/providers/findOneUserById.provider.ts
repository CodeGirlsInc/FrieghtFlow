import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindOneUserByIdProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findOneUser(userId: string) {
    let user;

    try {
      user = await this.userRepository.findOneBy({
        id: userId,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find user from the database due to server error',
      );
    }

    if (!user) {
      throw new NotFoundException('User not found/does not exist');
    }

    return user;
  }
}
