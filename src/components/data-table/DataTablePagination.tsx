import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Table } from '@tanstack/react-table';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  const startIdx = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endIdx = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1 select-none">
      <span className="text-xs sm:text-sm text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{startIdx}</span> to{' '}
        <span className="font-semibold text-text-primary">{endIdx}</span> of{' '}
        <span className="font-semibold text-text-primary">{totalRows}</span> records
      </span>

      <div className="flex items-center gap-2">
        {/* Page size select option */}
        <div className="flex items-center gap-1.5 mr-2">
          <span className="text-xs text-text-secondary whitespace-nowrap">Rows per page</span>
          <Select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="text-xs font-semibold text-text-primary bg-[#FAFAFA] border border-border-subtle rounded-lg px-2 py-1 focus:outline-none focus:border-accent-primary"
          >
            {[5, 10, 20, 30, 40].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronsLeft size={16} />}
            className="w-8 h-8 rounded-full border border-border-subtle/50 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[#FAFAFA] min-h-0 px-0"
          />
          <Button
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronLeft size={16} />}
            className="w-8 h-8 rounded-full border border-border-subtle/50 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[#FAFAFA] min-h-0 px-0"
          />

          {/* Page Indicator */}
          <span className="text-xs font-semibold text-text-secondary px-2">
            Page {pageIndex + 1} of {pageCount || 1}
          </span>

          <Button
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            icon={<ChevronRight size={16} />}
            className="w-8 h-8 rounded-full border border-border-subtle/50 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[#FAFAFA] min-h-0 px-0"
          />
          <Button
            variant="ghost"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            icon={<ChevronsRight size={16} />}
            className="w-8 h-8 rounded-full border border-border-subtle/50 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-[#FAFAFA] min-h-0 px-0"
          />
        </div>
      </div>
    </div>
  );
}
