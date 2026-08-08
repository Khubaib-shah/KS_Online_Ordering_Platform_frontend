import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { DataTablePagination } from '@/components/data-table/DataTablePagination';
import { DataTableEmptyRow } from '@/components/data-table/DataTableEmptyRow';
import { Skeleton } from '@/components/ui/Skeleton';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRowClick?: (row: TData) => void;
  toolbar?: React.ReactNode;
  bulkActions?: React.ReactNode;
  emptyMessage?: string;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (updater: any) => void;
  hidePagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  onRowClick,
  toolbar,
  bulkActions,
  emptyMessage,
  onClearFilters,
  manualPagination,
  pageCount,
  pagination,
  onPaginationChange,
  hidePagination = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      ...(pagination ? { pagination } : {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    ...(onPaginationChange ? { onPaginationChange } : {}),
    manualPagination,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedRowsCount = Object.keys(rowSelection).length;

  return (
    <div className="w-full flex flex-col select-none">
      {/* Top Bulk Actions or Regular Toolbar Bar */}
      <div className="relative w-full">
        {selectedRowsCount > 0 && bulkActions ? (
          <div className="flex items-center justify-between p-4 mb-5 bg-accent-tint-bg border border-accent-light/30 rounded-2xl animate-slide-in">
            <span className="text-sm font-medium text-text-primary">
              <span className="font-bold text-accent-primary">{selectedRowsCount}</span> row{selectedRowsCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">{bulkActions}</div>
          </div>
        ) : (
          toolbar
        )}
      </div>

      {/* Main Table Container Card */}
      <div className="relative bg-white border border-border-subtle/50 rounded-card shadow-card overflow-hidden">
        {/* Blur overlay during background fetching */}
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px] transition-all duration-300" />
        )}
        <div className={`overflow-x-auto transition-all duration-300 ${isFetching ? 'pointer-events-none select-none' : ''}`}>
          <table className="w-full border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border-subtle">
                  {headerGroup.headers.map((header, headerIdx) => (
                    <th
                      key={header.id}
                      className={`
                        px-5 py-3 text-[11px] font-bold text-text-secondary uppercase tracking-wider select-none bg-white font-poppins whitespace-nowrap
                        ${headerIdx === 0 ? 'border-l-[3px] border-l-transparent pl-4.5' : ''}
                      `}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                // Skeletons matching table layout
                Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <tr key={`skel-${i}`} className="border-b border-border-subtle/10">
                      {columns.map((_, colIdx) => (
                        <td
                          key={`skel-col-${colIdx}`}
                          className={`
                            px-5 py-3
                            ${colIdx === 0 ? 'border-l-[3px] border-l-transparent pl-4.5' : ''}
                          `}
                        >
                          <Skeleton className="h-5 w-full max-w-[120px] rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 bg-white">
                    <DataTableEmptyRow message={emptyMessage} onClearFilters={onClearFilters} />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const triggerRowClick = (e: React.MouseEvent | React.KeyboardEvent) => {
                    const target = e.target as HTMLElement;
                    if (
                      onRowClick &&
                      !target.closest('button') &&
                      !target.closest('input[type="checkbox"]') &&
                      !target.closest('select') &&
                      !target.closest('.no-row-click')
                    ) {
                      onRowClick(row.original);
                    }
                  };

                  return (
                    <tr
                      key={row.id}
                      tabIndex={onRowClick ? 0 : undefined}
                      onClick={triggerRowClick}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          triggerRowClick(e);
                        }
                      }}
                      className={`
                        group border-b border-border-subtle/20 hover:bg-surface-hover transition-colors cursor-pointer outline-none
                        focus-visible:bg-surface-hover/80 focus-visible:ring-1 focus-visible:ring-accent-primary
                        ${row.getIsSelected() ? 'bg-accent-tint-bg/20' : ''}
                      `}
                    >
                      {row.getVisibleCells().map((cell, cellIdx) => (
                        <td
                          key={cell.id}
                          className={`
                            px-5 py-3 text-xs font-semibold text-text-primary align-middle transition-all whitespace-nowrap
                            ${cellIdx === 0 ? 'border-l-[3px] border-l-transparent group-hover:border-l-accent-primary pl-4.5' : ''}
                          `}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!isLoading && !hidePagination && table.getRowModel().rows.length > 0 && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
