'use client';

import { Button } from './button';
import { cn } from '../../lib/utils';

interface PaginationProps {
  /** 1-based page currently shown. */
  page: number;
  totalPages: number;
  /** Rows on the current page — the "X" of the caption. */
  currentCount: number;
  /** Rows across every page — the "Y" of the caption. */
  total: number;
  /**
   * Plural noun for the caption, e.g. "users". Required so the sentence can
   * never lose it again (the disputes footer used to read "Showing X of Y").
   */
  itemLabel: string;
  onPageChange: (page: number) => void;
  /** Accessible name for the nav landmark, e.g. "Users pagination". */
  label: string;
  className?: string;
}

/**
 * Page buttons for a paginated table, collapsing runs of skipped pages into an
 * ellipsis so a 200-page result set doesn't render 200 controls. The first and
 * last pages are always reachable, with a `span` of pages either side of the
 * current one.
 */
function pageWindow(page: number, totalPages: number, span = 2): (number | 'gap')[] {
  const wanted = new Set<number>([1, totalPages]);
  for (let p = page - span; p <= page + span; p += 1) {
    if (p >= 1 && p <= totalPages) wanted.add(p);
  }
  const sorted = [...wanted].sort((a, b) => a - b);
  const window: (number | 'gap')[] = [];
  sorted.forEach((p, idx) => {
    if (idx > 0 && p - sorted[idx - 1] > 1) window.push('gap');
    window.push(p);
  });
  return window;
}

export function Pagination({
  page,
  totalPages,
  currentCount,
  total,
  itemLabel,
  onPageChange,
  label,
  className,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const atFirstPage = page <= 1;
  const atLastPage = page >= safeTotalPages;

  return (
    <nav aria-label={label} className={cn('flex items-center justify-between gap-4 text-sm', className)}>
      {/* The caption doubles as the live region: changing the page rewrites
          "Showing X of Y …" in place, so a screen-reader user hears both the
          new result range and the new position without a second announcement. */}
      <p role="status" aria-live="polite" className="text-muted-foreground">
        Showing {currentCount} of {total} {itemLabel} (page {page} of {safeTotalPages})
      </p>

      <ul className="flex items-center gap-2">
        <li>
          <Button
            variant="outline"
            size="sm"
            disabled={atFirstPage}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
        </li>

        {pageWindow(page, safeTotalPages).map((entry, idx) =>
          entry === 'gap' ? (
            <li key={`gap-${idx}`} aria-hidden="true" className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={entry}>
              <Button
                variant={entry === page ? 'default' : 'outline'}
                size="sm"
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Page ${entry}`}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </Button>
            </li>
          ),
        )}

        <li>
          <Button
            variant="outline"
            size="sm"
            disabled={atLastPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </li>
      </ul>
    </nav>
  );
}
