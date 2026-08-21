import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableSkeleton } from '../loaders/TableSkeleton';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyState?: ReactNode;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  emptyState,
  sortBy,
  sortDir,
  onSortChange,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.sortable ? 'sortable' : ''}
                style={{ textAlign: column.align ?? 'left', width: column.width }}
                onClick={() => column.sortable && onSortChange?.(column.key)}
              >
                <span className="flex items-center gap-1">
                  {column.header}
                  {column.sortable &&
                    (sortBy === column.key ? (
                      sortDir === 'asc' ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )
                    ) : (
                      <ArrowUpDown size={12} />
                    ))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} style={{ textAlign: column.align ?? 'left' }}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
