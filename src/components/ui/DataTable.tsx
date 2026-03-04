import { clsx } from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string }>({ columns, data, onRowClick, emptyMessage = 'No data available' }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-12 text-center">
        <p className="text-brewery-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brewery-700/30">
              {columns.map((col) => (
                <th key={col.key} className={clsx('px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase tracking-wider', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brewery-700/20">
            {data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={clsx(
                  'transition-colors',
                  onRowClick ? 'cursor-pointer hover:bg-brewery-800/40' : ''
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx('px-4 py-3 text-sm text-brewery-200', col.className)}>
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
