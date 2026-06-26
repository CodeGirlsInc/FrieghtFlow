import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { paginate } from './pagination.util';
import { PaginationDto } from './dto/pagination.dto';

function makeRepo(data: object[], total: number) {
  return {
    findAndCount: jest.fn().mockResolvedValue([data, total]),
  };
}

describe('PaginatedResponseDto', () => {
  it('computes totalPages correctly', () => {
    const dto = new PaginatedResponseDto([], 45, 1, 20);
    expect(dto.totalPages).toBe(3);
  });

  it('caps limit at 100', () => {
    const dto = new PaginatedResponseDto([], 0, 1, 200);
    expect(dto.limit).toBe(100);
  });

  it('totalPages is 0 when total is 0', () => {
    const dto = new PaginatedResponseDto([], 0, 1, 20);
    expect(dto.totalPages).toBe(0);
  });
});

describe('paginate()', () => {
  it('passes correct skip/take to repository', async () => {
    const repo = makeRepo([{ id: '1' }], 50);
    const query: PaginationDto = { page: 3, limit: 10 };
    await paginate(repo as never, query);
    expect(repo.findAndCount).toHaveBeenCalledWith({
      where: undefined,
      skip: 20,
      take: 10,
    });
  });

  it('caps limit at 100', async () => {
    const repo = makeRepo([], 0);
    const query: PaginationDto = { page: 1, limit: 150 };
    const result = await paginate(repo as never, query);
    expect(result.limit).toBe(100);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('defaults to page 1, limit 20', async () => {
    const repo = makeRepo([], 0);
    const query = {} as PaginationDto;
    await paginate(repo as never, query);
    expect(repo.findAndCount).toHaveBeenCalledWith({
      where: undefined,
      skip: 0,
      take: 20,
    });
  });

  it('returns correct totalPages math', async () => {
    const repo = makeRepo(Array(10).fill({}), 55);
    const result = await paginate(repo as never, { page: 1, limit: 10 });
    expect(result.totalPages).toBe(6);
    expect(result.total).toBe(55);
    expect(result.page).toBe(1);
  });
});
