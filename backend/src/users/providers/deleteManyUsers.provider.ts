import {
  BadRequestException,
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeleteManyUsersDto } from '../dto/deleteManyUsers.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class DeleteManyUsersProvider {
  constructor(private readonly datasource: DataSource) {}

  public async deleteUsers(deleteManyUsersDto: DeleteManyUsersDto) {
    const deletedUsers: string[] = [];
    let user;

    // create a query runner
    const queryRunner = this.datasource.createQueryRunner();

    try {
      // connect to the datasource
      await queryRunner.connect();

      // start the transaction
      await queryRunner.startTransaction();
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }

    // perform the operations
    try {
      for (let userId of deleteManyUsersDto.id) {
        user = queryRunner.manager.findOneBy(User, {
          id: userId,
        });

        await queryRunner.manager.delete(User, userId);

        // deletedUsers.push(user);
      }

      // if successful, commit the transactions
      await queryRunner.commitTransaction();
    } catch (error) {
      try {
        // if failed, rolled back the transaction
        await queryRunner.rollbackTransaction();
      } catch (error) {
        throw new ConflictException('Error rolling back the  transactions', {
          description: String(error),
        });
      }
    } finally {
      try {
        // finally, release the transaction
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException('Error releasing the transactions', {
          description: String(error),
        });
      }
    }

    if (!user) {
      throw new BadRequestException(
        'User not found or has been deleted already',
      );
    }

    return {
      status: true,
      message: 'Users deleted successfully',
      deletedUsers,
    };
  }
}
