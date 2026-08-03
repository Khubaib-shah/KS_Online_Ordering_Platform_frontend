import React from 'react';
import { TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Branch } from '@/types/branch';
import { InputField } from '@/components/ui/forms/InputField';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface BranchInventoryTabProps {
  branches: Branch[];
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  currentBranchObj: Branch;
  filteredInventory: any[];
  inventory: any[];
  adjustingItemId: string | null;
  setAdjustingItemId: (id: string | null) => void;
  adjustType: 'in' | 'out';
  setAdjustType: (type: 'in' | 'out') => void;
  adjustQty: number;
  setAdjustQty: (qty: number) => void;
  adjustReason: string;
  setAdjustReason: (reason: string) => void;
  handleAdjustStockSubmit: (e: React.FormEvent) => void;
}

export const BranchInventoryTab: React.FC<BranchInventoryTabProps> = ({
  branches,
  selectedBranchId,
  setSelectedBranchId,
  currentBranchObj,
  filteredInventory,
  inventory,
  adjustingItemId,
  setAdjustingItemId,
  adjustType,
  setAdjustType,
  adjustQty,
  setAdjustQty,
  adjustReason,
  setAdjustReason,
  handleAdjustStockSubmit
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
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

      {/* Inventory List & Management */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-border-subtle bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-poppins font-bold text-base text-text-primary">
                Outlet Raw Ingredients Stock
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Showing stock levels for{' '}
                <strong className="text-accent-primary">
                  {currentBranchObj?.name || 'this branch'}
                </strong>
                . Inventory must never be shared between branches.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Siloed Stock Model
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] font-extrabold uppercase tracking-wider text-text-secondary bg-slate-50/20">
                <th className="py-3 px-5">Ingredient Name</th>
                <th className="py-3 px-5 text-right">In-Stock Quantity</th>
                <th className="py-3 px-5 text-right">Last Updated</th>
                <th className="py-3 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-border-subtle last:border-b-0 hover:bg-slate-50/40 font-medium">
                  <td className="py-4 px-5 text-sm font-bold text-text-primary">{item.itemName}</td>
                  <td className="py-4 px-5 text-sm text-right font-bold text-text-primary">
                    <span className={item.qty < 15 ? 'text-red-600 bg-red-50 px-2 py-1 rounded-lg font-extrabold' : ''}>
                      {item.qty} {item.unit}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-xs text-right text-text-secondary">
                    {new Date(item.lastUpdated).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <button
                      onClick={() => {
                        setAdjustingItemId(item.id);
                        setAdjustType('in');
                      }}
                      className="text-xs font-bold text-accent-primary hover:underline cursor-pointer"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm font-medium text-text-secondary">
                    No inventory items tracked for this branch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {adjustingItemId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-[#fafafa] border border-accent-primary/20 rounded-2xl p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-accent-primary" />
                  <h4 className="font-poppins font-bold text-sm text-text-primary">
                    Adjust Stock Levels: {inventory.find((i) => i.id === adjustingItemId)?.itemName}
                  </h4>
                </div>
                <button
                  onClick={() => setAdjustingItemId(null)}
                  className="text-xs font-extrabold text-text-muted hover:text-text-primary cursor-pointer"
                >
                  Cancel ×
                </button>
              </div>

              <form onSubmit={handleAdjustStockSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-text-muted mb-1.5">
                    Adjustment Type
                  </label>
                  <Select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as 'in' | 'out')}
                    className="w-full h-10 px-3 bg-white border border-border-subtle rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                  >
                    <option value="in">IN - Restock / Received</option>
                    <option value="out">OUT - Kitchen Issue / Spoilage</option>
                  </Select>
                </div>

                <InputField
                  label="Quantity"
                  type="number"
                  value={adjustQty || ''}
                  onChange={(e) => setAdjustQty(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="e.g. 10"
                />

                <InputField
                  label="Reason / Reference"
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Vendor delivery"
                />

                <Button type="submit" variant="primary" className="h-10 text-xs py-0">
                  Confirm Adjustment
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
