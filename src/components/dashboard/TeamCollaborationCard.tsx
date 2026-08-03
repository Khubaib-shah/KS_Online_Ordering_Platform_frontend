import React from 'react';
import { motion, Variants } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { OrderFeedItem } from '@/types/order';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { SectionCard } from '@/components/ui/SectionCard';

interface TeamCollaborationCardProps {
  orders: OrderFeedItem[] | null;
  isLoading: boolean;
  onViewAll?: () => void;
}

export function TeamCollaborationCard({ orders, isLoading, onViewAll }: TeamCollaborationCardProps) {
  if (isLoading || !orders) {
    return (
      <SectionCard
        title="Today's Orders"
        description="Real-time order intake feed."
        className="lg:col-span-2 h-[380px] flex flex-col"
        contentClassName="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto pr-0.5 no-scrollbar flex flex-col gap-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                <div className="hidden sm:block shrink-0 w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
                <div className="min-w-0 flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/4 rounded animate-pulse" />
                  <Skeleton className="h-3 w-1/2 rounded animate-pulse" />
                </div>
              </div>
              <div className="text-right px-2 sm:px-4 shrink-0 flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-14 rounded animate-pulse" />
                <Skeleton className="h-2.5 w-10 rounded animate-pulse" />
              </div>
              <div className="shrink-0 flex items-center justify-end w-24">
                <Skeleton className="h-6 w-20 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  // Row entrance motion definitions
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  };

  const recentOrders = React.useMemo(() => {
    if (!orders) return [];
    return [...orders]
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const viewAllBtn = (
    <Button
      variant="secondary"
      size="sm"
      onClick={onViewAll}
      className="h-8 px-4.5 rounded-full border border-border-subtle text-xs font-semibold font-inter flex items-center gap-1"
    >
      <Plus size={12} />
      <span>View All</span>
    </Button>
  );

  return (
    <SectionCard
      id="team-collaboration-card"
      title="Today's Orders"
      description="Real-time order intake feed."
      action={viewAllBtn}
      className="lg:col-span-2 h-[380px] flex flex-col"
      contentClassName="flex-1 flex flex-col min-h-0 overflow-hidden"
    >
      {/* Orders Table Rows */}
      <div className="flex-1 overflow-y-auto pr-0.5 no-scrollbar">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3.5"
        >
          {recentOrders.map((order) => (
            <motion.div
              key={order.id}
              variants={rowVariants}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-surface-muted/60 transition-colors group cursor-pointer"
            >
              {/* Left Customer Info */}
              <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                <div className="hidden sm:block shrink-0">
                  <Avatar src={order.customerAvatarUrl} alt={order.customerName} size="md" />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block font-inter font-bold text-[13.5px] text-text-primary group-hover:text-accent-primary transition-colors truncate">
                    {order.customerName}
                  </span>
                  <span className="block font-inter text-xs text-text-secondary mt-0.5 leading-tight truncate">
                    {order.orderSummary}
                  </span>
                </div>
              </div>

              {/* Order Price Block */}
              <div className="text-right px-2 sm:px-4 shrink-0">
                <span className="font-poppins font-bold text-sm text-text-primary whitespace-nowrap">
                  {formatCurrency(order.total)}
                </span>
                <span className="block font-mono text-[10px] text-text-secondary mt-0.5 leading-none uppercase">
                  {order.id}
                </span>
              </div>

              {/* Status Badge Block */}
              <div className="shrink-0 flex items-center justify-end w-24">
                <StatusBadge status={order.status} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionCard>
  );
}

