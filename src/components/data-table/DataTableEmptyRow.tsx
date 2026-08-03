import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DataTableEmptyRowProps {
  message?: string;
  onClearFilters?: () => void;
}

export function DataTableEmptyRow({ message = 'No results match your filters', onClearFilters }: DataTableEmptyRowProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in select-none">
      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        <Search size={28} />
      </div>
      <h3 className="font-poppins font-medium text-text-primary text-base mb-1">No matches found</h3>
      <p className="text-text-secondary text-sm max-w-xs mb-4">{message}</p>
      {onClearFilters && (
        <Button
          variant="secondary"
          onClick={onClearFilters}
          className="px-4 py-2 text-xs font-semibold text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 rounded-full transition-all border-none"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
