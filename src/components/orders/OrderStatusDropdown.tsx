import { Order } from '@/types/order';
import React, { useState } from 'react';
import { Select } from '@components/ui/Select';
import { cn } from '@/lib/cn';

interface OrderStatusDropdownProps {
  currentStatus: Order['status'];
  onStatusChange: (status: Order['status']) => Promise<any>;
}

const ALL_STATUSES: { value: Order['status']; label: string }[] = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'ACCEPTED', label: 'ACCEPTED' },
  { value: 'PREPARING', label: 'PREPARING' },
  { value: 'READY', label: 'READY' },
  { value: 'OUT_FOR_DELIVERY', label: 'OUT FOR DELIVERY' },
  { value: 'DELIVERED', label: 'DELIVERED' },
  { value: 'COMPLETED', label: 'COMPLETED' },
  { value: 'CANCELLED', label: 'CANCELLED' }
];

const statusMap: Record<Order['status'], { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-[#CA8A04]/10', text: 'text-[#CA8A04]', dot: 'bg-[#CA8A04]' },
  ACCEPTED: { bg: 'bg-[#16A34A]/10', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
  PREPARING: { bg: 'bg-[#4F46E5]/10', text: 'text-[#4F46E5]', dot: 'bg-[#4F46E5]' },
  READY: { bg: 'bg-[#0D9488]/10', text: 'text-[#0D9488]', dot: 'bg-[#0D9488]' },
  OUT_FOR_DELIVERY: { bg: 'bg-[#2563EB]/10', text: 'text-[#2563EB]', dot: 'bg-[#2563EB]' },
  DELIVERED: { bg: 'bg-[#0E4B3E]/10', text: 'text-[#0E4B3E]', dot: 'bg-[#0E4B3E]' },
  COMPLETED: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', dot: 'bg-[#10B981]' },
  CANCELLED: { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' }
};

export function OrderStatusDropdown({ currentStatus, onStatusChange }: OrderStatusDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<Order['status'] | null>(null);

  const displayStatus = optimisticStatus || currentStatus;

  // Clear optimistic status if the true status from the parent catches up
  React.useEffect(() => {
    setOptimisticStatus(null);
  }, [currentStatus]);

  const filteredStatuses = ALL_STATUSES.filter((item) => {
    if (item.value === 'PENDING' && displayStatus !== 'PENDING') return false;
    if ((displayStatus === 'CANCELLED' || displayStatus === 'DELIVERED') && item.value === 'CANCELLED') return false;
    return true;
  });

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as Order['status'];
    if (nextStatus === currentStatus) return;

    setOptimisticStatus(nextStatus);
    setIsUpdating(true);
    
    try {
      await onStatusChange(nextStatus);
    } catch (err) {
      console.error(err);
      setOptimisticStatus(null); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  const config = statusMap[displayStatus] || statusMap.PENDING;

  return (
    <div 
      className={cn(
        "relative inline-block no-row-click select-none w-[130px]",
        "transition-all duration-300",
        isUpdating && "pointer-events-none blur-[2px] opacity-70"
      )} 
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        value={displayStatus}
        onChange={handleChange}
        className={cn(
          "!h-8 !rounded-full !text-[11px] font-poppins font-semibold border-none shadow-none transition-all cursor-pointer",
          config.bg,
          config.text,
          "hover:opacity-80 hover:brightness-95"
        )}
      >
        {filteredStatuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
