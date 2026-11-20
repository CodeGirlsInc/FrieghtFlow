import { BadRequestException } from '@nestjs/common';
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

/** UUID v4 pattern used to validate cursor payloads. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function encodeCursor(createdAt: Date, id: string): string {
  // Store the timestamp at full millisecond precision.  Using toISOString()
  // is safe because Postgres timestamp columns are compared by value; the
  // WHERE clause uses the same precision on both sides.
  const payload: CursorPayload = { createdAt: createdAt.toISOString(), id };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload {
  let payload: unknown;
  try {
    payload = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    );
  } catch {
    throw new BadRequestException('Invalid pagination cursor');
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof (payload as CursorPayload).createdAt !== 'string' ||
    typeof (payload as CursorPayload).id !== 'string'
  ) {
    throw new BadRequestException('Invalid pagination cursor');
  }

  const { createdAt, id } = payload as CursorPayload;

  // Validate createdAt is a parseable ISO date
  if (Number.isNaN(new Date(createdAt).getTime())) {
    throw new BadRequestException('Invalid pagination cursor: bad createdAt');
  }

  // Validate id is a UUID
  if (!UUID_PATTERN.test(id)) {
    throw new BadRequestException('Invalid pagination cursor: bad id');
  }

  return { createdAt, id };
}

/**
 * Validates and coerces a raw limit query-string value.
 * Returns a number between 1 and 100, or the given default.
 */
export function parseLimit(raw: string | number | undefined, defaultLimit = 20): number {
  if (raw === undefined || raw === null) return defaultLimit;
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    throw new BadRequestException('limit must be an integer between 1 and 100');
  }
  return n;
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
