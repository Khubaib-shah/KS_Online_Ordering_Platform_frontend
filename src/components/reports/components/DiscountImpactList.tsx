import { Select } from '../../ui/Select';
import React from 'react';
import { Input } from '../../ui/Input';
import { BaseCard } from '../../ui/BaseCard';

interface DiscountImpactItem {
  id: string;
  name: string;
  discountPercent: number;
  unitsSold: number;
  totalDiscountGiven: number;
}

interface DiscountImpactListProps {
  discountImpact: DiscountImpactItem[];
  isLoading?: boolean;
}

export function DiscountImpactList({ discountImpact, isLoading = false }: DiscountImpactListProps) {
  return (
    <BaseCard
      title="Discount Campaign Impact"
      description="Analyzing discount levels, coupon items checkout volumes, and total discounts surrendered."
      contentClassName="mt-4 flex-1 overflow-y-auto max-h-[250px] pr-1.5 flex flex-col gap-3.5 scrollbar-none"
    >
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-slate-50 border border-border-subtle/15 p-3 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex flex-col gap-2 w-1/2">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-3 w-16 rounded bg-slate-200" />
            </div>
            <div className="flex flex-col items-end gap-2 w-1/4">
              <div className="h-3 w-14 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
            </div>
          </div>
        ))
      ) : (
        <>
          {discountImpact.map((item) => (
            <div key={item.id} className="bg-slate-50 border border-border-subtle/15 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
              <div>
                <span className="font-bold text-text-primary block leading-relaxed">{item.name}</span>
                <span className="text-[10px] text-text-secondary font-medium mt-0.5 block">{item.discountPercent}% Off ({item.unitsSold} sold)</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Promo Given</span>
                <span className="text-xs font-bold text-red-500 mt-0.5 block">-Rs. {item.totalDiscountGiven.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {discountImpact.length === 0 && (
            <span className="block text-center text-xs text-text-secondary/40 py-8 italic">No items with active discount pricing found in database.</span>
          )}
        </>
      )}
    </BaseCard>
  );
}
