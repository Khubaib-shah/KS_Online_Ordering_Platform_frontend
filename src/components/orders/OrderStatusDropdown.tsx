import { Order } from '@/types/order';
import React, { useState } from 'react';
import { Select } from '@components/ui/Select';

interface OrderStatusDropdownProps {
  currentStatus: Order['status'];
  onStatusChange: (status: Order['status']) => Promise<any>;
}

const ALL_STATUSES: { value: Order['status']; label: string }[] = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'ACCEPTED', label: 'ACCEPTED' },
  { value: 'PREPARING', label: 'PREPARING' },
  { value: 'OUT_FOR_DELIVERY', label: 'OUT FOR DELIVERY' },
  { value: 'DELIVERED', label: 'DELIVERED' },
  { value: 'CANCELLED', label: 'CANCELLED' }
];


export function OrderStatusDropdown({ currentStatus, onStatusChange }: OrderStatusDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const filteredStatuses = ALL_STATUSES.filter(
    (item) =>
      !(
        (currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') &&
        item.value === 'CANCELLED'
      )
  );
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as Order['status'];
    if (nextStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await onStatusChange(nextStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block no-row-click select-none">
      <Select
        value={currentStatus}
        onChange={handleChange}
        disabled={isUpdating}
        className={`
          appearance-none font-poppins font-semibold text-xs rounded-full pl-3 pr-8 py-1.5 border border-border-subtle cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 transition-all bg-[#FAFAFA] text-text-primary disabled:opacity-50 disabled:cursor-not-allowed
          ${isUpdating ? 'animate-pulse' : ''}
        `}
      >
        {filteredStatuses.map((item) => (
          <option key={item.value} value={item.value} className="text-text-primary bg-white">
            {item.label}
          </option>
        ))}
      </Select>
      <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-text-secondary text-[10px]">
        ▼
      </div>
    </div>
  );
}
