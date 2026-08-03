import { Select } from '../ui/Select';import { Button } from '@/components/ui/Button';

import React, { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { useOrders } from '../../hooks/useOrders';
import { useUIStore } from '../../store/uiStore';;
import { ChefHat, Clock, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { Order } from '../../types/order';

export function KitchenView() {
  const { addToast } = useUIStore();;
  const { orders, isLoading, updateStatus, refetch } = useOrders();
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);

  // Filter orders to only show those that need kitchen action ('pending', 'preparing')
  useEffect(() => {
    const active = orders.filter(
      (o) => o.status === 'pending' || o.status === 'preparing'
    );
    setKitchenOrders(active);
  }, [orders]);

  // Handle status update inside kitchen view
  const handleUpdateStatus = async (orderNumber: string, nextStatus: Order['status']) => {
    try {
      await updateStatus(orderNumber, nextStatus);
      addToast(`Order ${orderNumber} is now ${nextStatus.toUpperCase()}`, 'success');
      refetch();
    } catch (err) {
      addToast('Failed to update kitchen ticket status', 'error');
    }
  };

  const getElapsedTime = (placedAtString: string) => {
    const placed = new Date(placedAtString).getTime();
    const diffMs = Date.now() - placed;
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  };

  // Re-render elapsed times every 30s
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">

      {/* Header and Live Monitor Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat size={22} className="text-accent-primary shrink-0 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-poppins">
              Kitchen Preparation Desk
            </h1>
          </div>
          <p className="text-xs font-semibold text-text-secondary mt-1">
            Live food prep monitoring and ticket fulfillment desk.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-tint-bg border border-accent-primary/10 text-accent-primary text-xs font-bold font-mono">
          <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
          <span>Active Monitor Mode</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-text-secondary font-mono">Loading active tickets...</span>
        </div>
      ) : kitchenOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 border border-dashed border-border-subtle rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-tint-bg border border-accent-primary/20 flex items-center justify-center text-accent-primary">
            <CheckCircle2 size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900 font-poppins">No Active Prep Tickets</h3>
            <p className="text-xs font-semibold text-text-secondary max-w-sm">
              All incoming food orders have been fully prepared and dispatched. Excellent work!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map((order) => {
            const isPreparing = order.status === 'preparing';
            const prepTimeMins = getElapsedTime(order.placedAt);

            return (
              <div
                key={order.orderNumber}
                className={`bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-200 ${isPreparing
                  ? 'border-accent-primary/30 ring-1 ring-accent-primary/10'
                  : 'border-border-subtle hover:border-slate-300'
                  }`}
              >
                {/* Card Top Header */}
                <div className={`p-4 flex items-center justify-between border-b border-border-subtle ${isPreparing ? 'bg-accent-tint-bg/40' : 'bg-slate-50/50'
                  }`}>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary block font-mono">
                      Ticket No.
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-border-subtle text-[10px] font-bold text-text-secondary font-mono">
                    <Clock size={12} className="text-amber-500 animate-pulse" />
                    <span>{prepTimeMins}</span>
                  </div>
                </div>

                {/* Items List - Large Font for Chefs */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="space-y-2.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4">
                        <div className="text-left">
                          <p className="text-sm font-extrabold text-slate-900">
                            {item.name}
                          </p>
                          {item.selectedVariants && item.selectedVariants.length > 0 && (
                            <p className="text-[10px] text-text-secondary font-semibold mt-0.5">
                              {item.selectedVariants.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold font-mono">
                            x{item.qty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Notes */}
                  {order.notes && order.notes.length > 0 && (
                    <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                      <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 font-mono">
                          Prep Instruction
                        </span>
                        <p className="text-[10px] text-amber-900 font-medium leading-normal mt-0.5">
                          {order.notes[0].text}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Trigger Button */}
                <div className="p-4 border-t border-border-subtle bg-slate-50/30">
                  {!isPreparing ? (
                    <Button variant="custom" size="none"                       onClick={() => handleUpdateStatus(order.orderNumber, 'PREPARING')}
                      className="w-full py-2.5 bg-accent-dark hover:opacity-90 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Play size={14} />
                      <span>Start Preparing</span>
                    </Button>
                  ) : (
                    <Button variant="custom" size="none"                       onClick={() => handleUpdateStatus(order.orderNumber, 'READY')}
                      className="w-full py-2.5 bg-accent-primary hover:bg-accent-dark text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Ready for Pickup</span>
                    </Button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
