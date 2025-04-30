import { Injectable } from '@nestjs/common';
import { User } from '../entities/users.entity';
import { FindOneUserByIdProvider } from './findOneUserById.provider';

@Injectable()
export class GetUserProfileProvider {
  constructor(private readonly findUserByIdProvider: FindOneUserByIdProvider) {}

  public async getUserProfile(user: User) {
    const userDetails = await this.findUserByIdProvider.findOneUser(user.id);

    return userDetails;
  }
}
