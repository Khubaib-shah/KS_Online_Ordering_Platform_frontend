import React from 'react';
import { Order } from '../../types/order';

interface OrderStatusBadgeProps {
  status: Order['status'];
  size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusBadge({ status, size = 'sm' }: OrderStatusBadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-poppins font-semibold rounded-full select-none capitalize';

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-1',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-4 py-2'
  };

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

  const config = statusMap[status] || statusMap.PENDING;

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
