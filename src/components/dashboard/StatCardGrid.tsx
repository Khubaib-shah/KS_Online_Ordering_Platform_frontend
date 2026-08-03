import { StatCard } from './StatCard';
import type { StatCardData } from '@/types/dashboard';

interface StatCardGridProps {
  stats: StatCardData[] | null;
  isLoading: boolean;
  onCardClick?: (id: string) => void;
}

export function StatCardGrid({ stats, isLoading, onCardClick }: StatCardGridProps) {
  if (isLoading || !stats) {
    const fallbackStats: Partial<StatCardData>[] = [
      { id: 'today-revenue', title: "Total Revenue", variant: 'filled' },
      { id: 'today-orders', title: "Total Orders", variant: 'white' },
      { id: 'avg-order-value', title: "Avg Order Value", variant: 'white' },
      { id: 'pending-orders', title: "Pending Orders", variant: 'white' },
    ];

    const activeFallback = fallbackStats.filter(stat => stat.id !== 'today-customers' && stat.id !== 'cancelled-orders');

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-4 sm:mb-5 lg:mb-6">
        {activeFallback.map((stat) => (
          <StatCard
            key={stat.id}
            data={stat as StatCardData}
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  const activeStats = stats.filter(Boolean);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-4 sm:mb-5 lg:mb-6">
      {activeStats.map((stat) => (
        <StatCard
          key={stat.id}
          data={stat}
          onClick={onCardClick ? () => onCardClick(stat.id) : undefined}
        />
      ))}
    </div>
  );
}
