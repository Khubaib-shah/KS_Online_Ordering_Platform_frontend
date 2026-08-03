import {
  Building,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { useBranchStore } from '@/store/branchStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';

interface QuickActionsCardProps {
  onRefreshData?: () => void;
}

export function QuickActionsCard({ onRefreshData }: QuickActionsCardProps) {
  const { branches, activeBranchFilterId, setBranchFilter } = useBranchStore();
  const { setActiveNavId, setOpenAddItemTrigger, addToast } = useUIStore();;

  const [storeStatus, setStoreStatus] = useState<'open' | 'closed'>(() => {
    return localStorage.getItem('indolj_store_closed_override') === 'true' ? 'closed' : 'open';
  });

  const toggleStoreStatus = () => {
    const nextStatus = storeStatus === 'open' ? 'closed' : 'open';
    setStoreStatus(nextStatus);
    localStorage.setItem('indolj_store_closed_override', nextStatus === 'closed' ? 'true' : 'false');

    addToast(
      `Store operational status set to ${nextStatus === 'open' ? 'ONLINE (Accepting Orders)' : 'OFFLINE (Suspended)'}`,
      nextStatus === 'open' ? 'success' : 'error'
    );
  };

  return (
    <SectionCard
      id="operations-quick-actions"
      title="Quick Panel"
      description="Instant actions to test, switch, and operate store outlets."
      className="h-auto min-h-[220px] flex flex-col"
      contentClassName="flex-1 flex flex-col justify-between gap-4"
    >
      {/* 1. Operating status toggle */}
      <div
        onClick={toggleStoreStatus}
        className="w-full min-h-[52px] h-auto py-3 px-4 rounded-xl border border-border-subtle bg-white hover:bg-surface-hover hover:border-text-secondary/20 flex items-center justify-between cursor-pointer select-none transition-all shadow-2xs min-w-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            {storeStatus === 'open' ? (
              <ToggleRight size={24} className="text-[#0E4B3E]" />
            ) : (
              <ToggleLeft size={24} className="text-text-secondary" />
            )}
          </div>
          <span className="font-poppins font-bold text-sm text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">Operating Hours</span>
        </div>
        <span className={`text-xs font-bold whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full border ${storeStatus === 'open' ? 'bg-emerald-50 text-[#0E4B3E] border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
          {storeStatus === 'open' ? '🟢 ONLINE (OPEN)' : '🔴 OFFLINE (CLOSED)'}
        </span>
      </div>

      {/* 2. Branch Selector Pills */}
      <div>
        <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 flex items-center gap-1.5 font-inter select-none">
          <Building size={12} className="text-[#0E4B3E]" />
          <span>Outlet Switcher</span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="ghost"
            onClick={() => setBranchFilter('all')}
            className={`
              h-7 px-3.5 rounded-full text-[10px] font-semibold font-inter min-h-0 ${activeBranchFilterId === 'all'
                ? 'bg-[#0E4B3E] border border-[#0E4B3E] text-white hover:bg-[#0b3c31] hover:text-white'
                : 'bg-white border border-border-subtle hover:bg-surface-hover text-text-primary'
              }
            `}
          >
            All Outlets
          </Button>
          {branches.map((b) => (
            <Button
              key={b.id}
              variant="ghost"
              onClick={() => setBranchFilter(b.id)}
              className={`
                h-7 px-3.5 rounded-full text-[10px] font-semibold font-inter min-h-0 ${activeBranchFilterId === b.id
                  ? 'bg-[#0E4B3E] border border-[#0E4B3E] text-white hover:bg-[#0b3c31] hover:text-white'
                  : 'bg-white border border-border-subtle hover:bg-surface-hover text-text-primary'
                }
              `}
            >
              {b.area}
            </Button>
          ))}
        </div>
      </div>

      {/* 3. Mini Footer Tip */}
      <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-[10px] text-text-secondary font-medium select-none min-w-0 mt-2">
        <span className="flex items-center gap-1 truncate mr-2">
          <Sparkles size={11} className="text-amber-400 shrink-0" />
          <span className="truncate">Filter outlets for custom metrics.</span>
        </span>
        <Button
          variant="ghost"
          onClick={() => {
            setActiveNavId('menu');
            setTimeout(() => setOpenAddItemTrigger(true), 50);
          }}
          className="text-[#0E4B3E] hover:underline hover:bg-transparent font-bold shrink-0 whitespace-nowrap px-0 min-h-0 h-auto"
        >
          + Add Dish
        </Button>
      </div>

    </SectionCard>
  );
}
