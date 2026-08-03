import React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Column } from '@tanstack/react-table';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <div
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="flex items-center gap-1 cursor-pointer hover:text-text-primary select-none group/col transition-all"
    >
      <span>{title}</span>
      {isSorted === 'desc' ? (
        <ArrowDown size={14} className="text-accent-primary" />
      ) : isSorted === 'asc' ? (
        <ArrowUp size={14} className="text-accent-primary" />
      ) : (
        <ChevronsUpDown size={14} className="opacity-0 group-hover/col:opacity-100 text-text-secondary transition-all" />
      )}
    </div>
  );
}
