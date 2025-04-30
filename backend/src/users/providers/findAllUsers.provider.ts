import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { PaginationQueryDto } from 'src/common/pagination/dtos/paginationQuery.dto';

export class FindAllUsersProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async allUsers(paginationQueryDto: PaginationQueryDto) {
    return await this.paginationProvider.paginateQuery(
      paginationQueryDto,
      this.usersRepository,
    );
  }
}
