import { Repository, FindOptionsWhere, LessThan } from 'typeorm';

export interface CursorPageOptions {
  cursor?: string; // opaque base64 cursor from previous response
  limit?: number;
  // Legacy offset fallback
  page?: number;
  pageSize?: number;
}

export interface CursorPageResult<T> {
  data: T[];
  nextCursor: string | null;
  total?: number; // only populated for offset fallback
}

interface CursorPayload {
  createdAt: string;
  id: string;
}

export function encodeCursor(createdAt: Date, id: string): string {
  const payload: CursorPayload = { createdAt: createdAt.toISOString(), id };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload {
  try {
    return JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as CursorPayload;
  } catch {
    throw new Error('Invalid pagination cursor');
  }
}

export async function cursorPaginate<T extends { id: string; createdAt: Date }>(
  repo: Repository<T>,
  where: FindOptionsWhere<T>,
  options: CursorPageOptions,
): Promise<CursorPageResult<T>> {
  const limit = Math.min(options.limit ?? 20, 100);

  // Offset fallback for backwards compatibility
  if (
    !options.cursor &&
    (options.page !== undefined || options.pageSize !== undefined)
  ) {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? limit;
    const [data, total] = await repo.findAndCount({
      where,
      order: { createdAt: 'DESC', id: 'DESC' } as never,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { data, nextCursor: null, total };
  }

  const cursorWhere = options.cursor
    ? (() => {
        const { createdAt, id } = decodeCursor(options.cursor);
        return [
          { ...where, createdAt: LessThan(new Date(createdAt)) },
          { ...where, createdAt: new Date(createdAt), id: LessThan(id) },
        ] as FindOptionsWhere<T>[];
      })()
    : where;

  const data = await repo.find({
    where: cursorWhere,
    order: { createdAt: 'DESC', id: 'DESC' } as never,
    take: limit + 1,
  });

  const hasMore = data.length > limit;
  if (hasMore) data.pop();

  const nextCursor =
    hasMore && data.length > 0
      ? encodeCursor(data[data.length - 1].createdAt, data[data.length - 1].id)
      : null;

  return { data, nextCursor };
}
