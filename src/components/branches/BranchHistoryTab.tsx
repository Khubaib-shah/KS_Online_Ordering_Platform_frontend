import React from 'react';
import { Branch } from '../../types/branch';

interface BranchHistoryTabProps {
  branches: Branch[];
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  currentBranchObj: Branch;
  filteredMovements: any[];
}

export const BranchHistoryTab: React.FC<BranchHistoryTabProps> = ({
  branches,
  selectedBranchId,
  setSelectedBranchId,
  currentBranchObj,
  filteredMovements
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
              className={`w-full text-left p-3.5 rounded-xl border font-semibold text-sm transition-all flex items-center justify-between cursor-pointer ${
                selectedBranchId === b.id
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

      {/* Logs Table */}
      <div className="lg:col-span-3 bg-white border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border-subtle bg-slate-50/50">
          <h3 className="font-poppins font-bold text-base text-text-primary">
            Stock Transaction Audit Trail
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit logs of all stock additions or withdrawals for{' '}
            <strong className="text-accent-primary">
              {currentBranchObj?.name || 'this branch'}
            </strong>
            .
          </p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] font-extrabold uppercase tracking-wider text-text-secondary bg-slate-50/20">
              <th className="py-3 px-5">Timestamp</th>
              <th className="py-3 px-5">Ingredient</th>
              <th className="py-3 px-5 text-center">Type</th>
              <th className="py-3 px-5 text-right">Qty Adjusted</th>
              <th className="py-3 px-5 pl-8">Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((move) => {
              const isIn = move.type === 'in';
              return (
                <tr key={move.id} className="border-b border-border-subtle last:border-b-0 hover:bg-slate-50/40 text-xs font-semibold">
                  <td className="py-3.5 px-5 text-text-secondary whitespace-nowrap">
                    {new Date(move.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 text-sm font-bold text-text-primary">{move.itemName}</td>
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        isIn
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isIn ? 'Stock In' : 'Stock Out'}
                    </span>
                  </td>
                  <td className={`py-3.5 px-5 text-right font-bold text-sm ${isIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isIn ? '+' : '-'}{move.qty}
                  </td>
                  <td className="py-3.5 px-5 text-text-secondary pl-8">{move.reason}</td>
                </tr>
              );
            })}

            {filteredMovements.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm font-medium text-text-secondary">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
