import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateManyUsersDto } from '../dto/createManyUsers.dto';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class CreateManyUsersProvider {
  constructor(private readonly datasource: DataSource) {}

  public async createUsers(createManyUsersDto: CreateManyUsersDto) {
    let newUsers: User[] = [];

    // create query runner instance
    const queryRunner = this.datasource.createQueryRunner();

    try {
      // connect query runner to the datasource
      await queryRunner.connect();

      // start the transaction
      await queryRunner.startTransaction();
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }

    try {
      // perform the transaction
      for (let user of createManyUsersDto.users) {
        const newUser = queryRunner.manager.create(User, user);
        const result = await queryRunner.manager.save(newUser);

        newUsers.push(result);
      }

      // commit the transaction if successful
      await queryRunner.commitTransaction();
    } catch (error) {
      // rollback the transaction if unsuccessful
      await queryRunner.rollbackTransaction();

      throw new ConflictException('Error completing the transaction', {
        description: String(error),
      });
    } finally {
      // release the transaction
      try {
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException('Error releasing the transaction', {
          description: String(error),
        });
      }
    }

    return newUsers;
  }
}
