import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

export async function paginate<T extends ObjectLiteral>(
  repo: Repository<T>,
  query: PaginationDto,
  where?: FindOptionsWhere<T>,
): Promise<PaginatedResponseDto<T>> {
  const limit = Math.min(query.limit ?? 20, 100);
  const page = query.page ?? 1;

  const [data, total] = await repo.findAndCount({
    where,
    skip: (page - 1) * limit,
    take: limit,
  });

  return new PaginatedResponseDto(data, total, page, limit);
}
