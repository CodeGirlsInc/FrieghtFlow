import { Repository } from 'typeorm';
import {
  cursorPaginate,
  decodeCursor,
  encodeCursor,
} from './cursor-pagination.util';

interface TestRecord {
  id: string;
  createdAt: Date;
  ownerId: string;
}

describe('cursor-pagination.util', () => {
  it('round-trips cursor values', () => {
    const createdAt = new Date('2026-08-15T12:00:00.000Z');
    const cursor = encodeCursor(createdAt, 'record-1');

    expect(decodeCursor(cursor)).toEqual({
      createdAt: createdAt.toISOString(),
      id: 'record-1',
    });
  });

  it('paginates with the offset fallback when page is provided', async () => {
    const repo = {
      findAndCount: jest.fn().mockResolvedValue([
        [{ id: 'a', createdAt: new Date('2026-08-15T12:00:00.000Z'), ownerId: 'u1' }],
        1,
      ]),
    } as unknown as Repository<TestRecord>;

    const result = await cursorPaginate(repo, { ownerId: 'u1' }, { page: 2, pageSize: 10 });

    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: 'u1' },
        skip: 10,
        take: 10,
      }),
    );
    expect(result).toEqual({
      data: [{ id: 'a', createdAt: new Date('2026-08-15T12:00:00.000Z'), ownerId: 'u1' }],
      nextCursor: null,
      total: 1,
    });
  });

  it('uses the cursor and emits the next cursor when more rows remain', async () => {
    const first = { id: 'b', createdAt: new Date('2026-08-15T12:00:00.000Z'), ownerId: 'u1' };
    const second = { id: 'a', createdAt: new Date('2026-08-14T12:00:00.000Z'), ownerId: 'u1' };
    const repo = {
      find: jest.fn().mockResolvedValue([first, second]),
    } as unknown as Repository<TestRecord>;

    const result = await cursorPaginate(
      repo,
      { ownerId: 'u1' },
      { cursor: encodeCursor(new Date('2026-08-16T12:00:00.000Z'), 'zzz'), limit: 1 },
    );

    expect(repo.find).toHaveBeenCalled();
    expect(result.data).toEqual([first]);
    expect(result.nextCursor).toBeTruthy();
  });

  it('rejects invalid cursors', () => {
    expect(() => decodeCursor('not-a-cursor')).toThrow('Invalid pagination cursor');
  });
});
