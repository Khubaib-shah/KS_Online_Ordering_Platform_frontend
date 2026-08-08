import { Plus, Download, Calendar, RefreshCw } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';

interface DashboardHeaderProps {
  onAddMenuItem?: () => void;
  onExportReport?: () => void;
  onRefresh?: () => void;
  branchFilter: string;
  onBranchFilterChange: (id: string) => void;
  dateFilter: 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'current-shift' | 'previous-shift';
  onDateFilterChange: (filter: 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'current-shift' | 'previous-shift') => void;
  showBranchFilter: boolean;
  branches: { id: string; name: string; area?: string }[];
}

export function DashboardHeader({
  onAddMenuItem,
  onExportReport,
  onRefresh,
  branchFilter,
  onBranchFilterChange,
  dateFilter,
  onDateFilterChange,
  showBranchFilter,
  branches
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 select-none">
      <div>
        <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary leading-[1.2] pl-0.5">
          Dashboard
        </h1>
        <p className="font-inter text-[15px] sm:text-base text-text-secondary mt-1 leading-[1.5]">
          Manage your orders, menu, and performance with ease.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {showBranchFilter && (
          <div className="w-48">
            <Combobox
              options={[
                { value: 'all', label: 'All Branches' },
                ...branches.map((b) => ({ value: b.id, label: b.area || b.name }))
              ]}
              value={branchFilter}
              onChange={onBranchFilterChange}
              placeholder="All Branches"
              searchPlaceholder="Search branches..."
              className=""
            />
          </div>
        )}

        {/* Date Filter */}
        <Select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value as any)}
          className="font-semibold"
        >
          <option value="current-shift">Current Shift</option>
          <option value="previous-shift">Previous Shift</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </Select>

        <Button variant="secondary" onClick={onRefresh} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-2.5 sm:px-4 py-2">
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Button variant="secondary" onClick={onExportReport} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap px-2.5 sm:px-4 py-2">
          <Download size={14} />
          <span className="hidden sm:inline">Export Report</span>
          <span className="inline sm:hidden">Export</span>
        </Button>

        <Button variant="primary" onClick={onAddMenuItem} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-nowrap px-2.5 sm:px-4 py-2 bg-accent-primary hover:bg-accent-dark border-none text-white">
          <Plus size={14} />
          <span className="hidden sm:inline">Add Menu Item</span>
          <span className="inline sm:hidden">Add Item</span>
        </Button>
      </div>
    </div>
  );
}
