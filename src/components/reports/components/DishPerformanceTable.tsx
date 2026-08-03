import { Select } from '../../ui/Select';
import React from 'react';
import { Input } from '../../ui/Input';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { BaseCard } from '../../ui/BaseCard';

interface DishPerformanceItem {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

interface DishPerformanceTableProps {
  title: string;
  type: 'best' | 'worst';
  items: DishPerformanceItem[];
  isLoading?: boolean;
}

export function DishPerformanceTable({ title, type, items, isLoading = false }: DishPerformanceTableProps) {
  const isBest = type === 'best';
  const Icon = isBest ? TrendingUp : TrendingDown;
  const iconColor = isBest ? 'text-[#16A34A]' : 'text-red-500';
  const qtyColor = isBest ? 'text-accent-primary' : 'text-red-500';

  return (
    <BaseCard
      title={
        <span className="flex items-center gap-2">
          <Icon size={18} className={iconColor} />
          {title}
        </span>
      }
      divider
      headerClassName="px-6 py-5 pb-4"
      contentClassName="px-6 pb-6 pt-4"
      noPadding
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-subtle/15 text-left text-xs text-text-secondary uppercase tracking-wider">
              <th className="py-2 font-bold">Dish Name</th>
              <th className="py-2 font-bold">Category</th>
              <th className="py-2 font-bold text-center">Units Sold</th>
              <th className="py-2 font-bold text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-subtle/10 py-3">
                  <td className="py-3"><div className="h-4 w-32 rounded bg-slate-100 animate-pulse" /></td>
                  <td className="py-3"><div className="h-4 w-20 rounded bg-slate-100 animate-pulse" /></td>
                  <td className="py-3"><div className="h-4 w-12 mx-auto rounded bg-slate-100 animate-pulse" /></td>
                  <td className="py-3"><div className="h-4 w-16 ml-auto rounded bg-slate-100 animate-pulse" /></td>
                </tr>
              ))
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border-subtle/10 text-xs font-semibold text-text-primary py-3">
                  <td className="py-3 font-bold">{item.name}</td>
                  <td className="py-3 text-text-secondary">{item.category}</td>
                  <td className={`py-3 text-center ${qtyColor} font-bold`}>{item.unitsSold} qty</td>
                  <td className="py-3 text-right">Rs. {item.revenue.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </BaseCard>
  );
}
