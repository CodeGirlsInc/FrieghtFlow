/* eslint-disable @typescript-eslint/no-empty-object-type */
import { useState, useMemo } from 'react';

type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  striped?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  rowsPerPage?: number;
};

const Table = <T extends {}>({
  columns,
  data,
  striped = false,
  sortable = false,
  pagination = false,
  rowsPerPage = 10,
}: TableProps<T>
) => {

  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: keyof T) => {
    if (!sortable) {
      return;
    }
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [data, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage, pagination]);


  return (
    <div>
      <table className={`w-full border-collapse ${striped ? 'striped' : ''}`}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(col.key)}
                className="cursor-pointer border-b p-2 text-left"
              >
                {col.label}
                {sortKey === col.key ? (sortOrder === 'asc' ? '&#9650;' : ' &#9650;') : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, i) => (
            <tr key={i} className={striped && i % 2 === 0 ? 'bg-gray-100' : ''}>
              {columns.map(col => (
                <td key={String(col.key)} className="border p-2">{String(row[col.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div className="mt-2 flex justify-end gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(p => (p * rowsPerPage < sortedData.length ? p + 1 : p))}
            disabled={currentPage * rowsPerPage >= sortedData.length}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export { Table }
