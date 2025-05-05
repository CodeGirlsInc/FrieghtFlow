import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class FindOneUserByEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findUserByEmail(email: string): Promise<User> {
    let user;

    try {
      user = await this.userRepository.findOneBy({ email: email });
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }
}
