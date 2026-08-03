import React from 'react';
import { Store, Power } from 'lucide-react';
import { Branch } from '@/types/branch';
import { Button } from '@/components/ui/Button';

interface BranchCatalogTabProps {
  branches: Branch[];
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  currentBranchObj: Branch;
  isMenuLoading: boolean;
  menuItems: any[];
  disabledProducts: Record<string, string[]>;
  toggleProductBranch: (branchId: string, itemId: string) => void;
}

export const BranchCatalogTab: React.FC<BranchCatalogTabProps> = ({
  branches,
  selectedBranchId,
  setSelectedBranchId,
  currentBranchObj,
  isMenuLoading,
  menuItems,
  disabledProducts,
  toggleProductBranch
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Branch Selector Sidebar */}
      <div className="lg:col-span-1 space-y-2.5">
        <span className="text-xs uppercase font-extrabold tracking-wider text-text-muted">
          Select Branch
        </span>
        <div className="flex flex-col gap-1.5">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranchId(b.id)}
              className={`w-full text-left p-3.5 rounded-xl border font-semibold text-sm transition-all flex items-center justify-between cursor-pointer ${selectedBranchId === b.id
                ? 'bg-accent-tint-bg text-accent-primary border-accent-primary/40 shadow-xs'
                : 'bg-white text-text-secondary border-border-subtle hover:bg-slate-50'
                }`}
            >
              <span>{b.name}</span>
              <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded-full text-text-muted">
                {b.area}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Central Catalog Products */}
      <div className="lg:col-span-3">
        <div className="bg-white border border-border-subtle rounded-2xl p-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-poppins font-bold text-lg text-text-primary text-left">
              Product Catalog Central Switch
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 text-left">
              Toggle which products are served at{' '}
              <strong className="text-accent-primary">
                {currentBranchObj?.name || 'this branch'}
              </strong>
              . Disabled products are hidden on the storefront.
            </p>
          </div>
          <span className="text-xs font-bold text-accent-primary shrink-0 bg-accent-tint-bg border border-accent-primary/20 px-3 py-1.5 rounded-full">
            Central catalog inherited dynamically
          </span>
        </div>

        {isMenuLoading ? (
          <p className="text-sm font-medium text-text-secondary animate-pulse text-left">Loading menu items...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => {
              const isDisabled = disabledProducts[selectedBranchId]?.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 flex items-center justify-between transition-all bg-white ${isDisabled ? 'border-red-100 bg-red-50/5 opacity-80' : 'border-border-subtle hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 object-cover rounded-xl border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-400">
                        <Store size={18} />
                      </div>
                    )}
                    <div className="min-w-0 text-left">
                      <h4 className="font-poppins font-bold text-sm text-text-primary truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-text-secondary font-medium mt-0.5">
                        {item.category} • Rs. {item.basePrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => toggleProductBranch(selectedBranchId, item.id)}
                    variant="ghost"
                    icon={<Power size={11} />}
                    className={`w-24 h-8 min-h-0 px-0 text-[11px] font-extrabold uppercase tracking-wider rounded-lg border ${isDisabled
                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                  >
                    {isDisabled ? 'Disabled' : 'Enabled'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
