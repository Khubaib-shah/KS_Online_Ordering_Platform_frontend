import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters,
  onClearFilters,
  hasActiveFilters = false
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 select-none">
      <div className="flex flex-1 flex-wrap items-center gap-3">

        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>

        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

        {hasActiveFilters && onClearFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearFilters}
            icon={<X size={13} />}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent-primary bg-accent-primary/5 hover:bg-accent-primary/10 rounded-full px-3 py-1.5 border border-accent-primary/15"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
