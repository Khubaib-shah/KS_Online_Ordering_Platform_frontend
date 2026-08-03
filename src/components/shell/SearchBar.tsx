import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';;


export function SearchBar() {
  const { setCommandPaletteOpen } = useUIStore();;

  return (
    <Button variant="custom" size="none" onClick={() => setCommandPaletteOpen(true)}
      className="relative w-full !max-w-[320px] h-10 rounded-full bg-surface-muted border border-border-subtle hover:border-accent-primary/40 flex items-center justify-between px-4 transition-all duration-200 hover:bg-slate-50 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-accent-primary/20 shrink-0 group shadow-xs"
      title="Open Command Palette (Ctrl+K)"
    >
      <div className="flex items-center gap-2.5 text-text-secondary group-hover:text-text-primary transition-colors">
        <Search size={15} className="text-text-secondary/80 group-hover:text-accent-primary transition-colors" />
        <span className="text-xs font-semibold font-inter select-none">Search commands & menus...</span>
      </div>
      <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border-subtle/70 bg-white px-2 font-mono text-[9px] font-bold text-text-secondary/80 shadow-2xs select-none">
        Ctrl K
      </kbd>
    </Button>
  );
}
