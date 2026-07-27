'use client';

import { useState, useMemo } from 'react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  totalItems?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  renderMobileCard?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  pageSize = 20,
  totalItems,
  page: controlledPage,
  onPageChange,
  sortColumn,
  sortDirection,
  onSort,
  renderMobileCard,
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);
  const page = controlledPage ?? internalPage;
  const total = totalItems ?? data.length;
  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (columnId: string) => {
    if (!onSort) return;
    const newDir = sortColumn === columnId && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnId, newDir);
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const paginatedData = useMemo(() => {
    if (totalItems) return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize, totalItems]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow">
        <p className="text-sm text-muted-foreground text-center py-12">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: stacked cards */}
      {renderMobileCard && (
        <div className="md:hidden space-y-2">
          {paginatedData.map((row, i) => (
            <div key={row.id ?? i}>
              {renderMobileCard(row)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop: table */}
      <div className={`rounded-xl border bg-card shadow overflow-hidden ${renderMobileCard ? 'hidden md:block' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={
                      sortColumn === col.id
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={`text-left px-4 py-3 font-medium text-muted-foreground ${
                      col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''
                    } ${col.className ?? ''}`}
                    onClick={col.sortable ? () => handleSort(col.id) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && sortColumn === col.id && (
                        <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.map((row, i) => (
                <tr key={row.id ?? i} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.id} className={`px-4 py-3 ${col.className ?? ''}`}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] ?? '')
                          : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm mt-3">
          <p className="text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-border text-sm font-medium disabled:opacity-50 disabled:pointer-events-none hover:bg-accent transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-md border border-border text-sm font-medium disabled:opacity-50 disabled:pointer-events-none hover:bg-accent transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
