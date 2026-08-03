import { Badge } from '@/components/ui/Badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  
  const labelMap: Record<string, string> = {
    delivered: 'Delivered',
    completed: 'Completed',
    preparing: 'Preparing',
    accepted: 'Accepted',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    pending: 'Pending',
    cancelled: 'Cancelled',
  };

  const variantMap: Record<string, 'completed' | 'progress' | 'pending' | 'danger'> = {
    delivered: 'completed',
    completed: 'completed',
    preparing: 'progress',
    accepted: 'progress',
    ready: 'completed',
    out_for_delivery: 'progress',
    pending: 'pending',
    cancelled: 'danger',
  };

  const label = labelMap[normalizedStatus] || 'Pending';
  const variant = variantMap[normalizedStatus] || 'pending';

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}
