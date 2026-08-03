import React, { useState, } from 'react';import { Button } from '@/components/ui/Button';

import { motion, AnimatePresence } from 'motion/react';
import { GripVertical, Clock, Play, CheckCircle2, ShoppingBag, MapPin, Check } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Order } from '@/types/order';

interface KanbanBoardProps {
  orders: Order[];
  onStatusChange: (orderNumber: string, status: Order['status']) => Promise<any>;
  onBack: () => void;
}

const COLUMNS: { id: Order['status']; label: string; color: string; border: string; bg: string }[] = [
  { id: 'PENDING', label: 'Pending', color: '#CA8A04', border: 'border-t-[#CA8A04]', bg: 'bg-[#CA8A04]/[0.02]' },
  { id: 'ACCEPTED', label: 'Accepted', color: '#16A34A', border: 'border-t-[#16A34A]', bg: 'bg-[#16A34A]/[0.02]' },
  { id: 'PREPARING', label: 'Preparing', color: '#4F46E5', border: 'border-t-[#4F46E5]', bg: 'bg-[#4F46E5]/[0.02]' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: '#2563EB', border: 'border-t-[#2563EB]', bg: 'bg-[#2563EB]/[0.02]' },
  { id: 'DELIVERED', label: 'Delivered', color: '#0E4B3E', border: 'border-t-[#0E4B3E]', bg: 'bg-[#0E4B3E]/[0.02]' }
];

export function KanbanBoard({ orders, onStatusChange, onBack }: KanbanBoardProps) {
  const { addToast } = useUIStore();;
  const [draggedOrderNo, setDraggedOrderNo] = useState<string | null>(null);
  const [successPulse, setSuccessPulse] = useState<{ orderNo: string; colId: string } | null>(null);

  // Filter out cancelled orders for Kanban view
  const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');

  const handleDragStart = (e: React.DragEvent, orderNumber: string) => {
    setDraggedOrderNo(orderNumber);
    e.dataTransfer.setData('text/plain', orderNumber);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Order['status']) => {
    e.preventDefault();
    const orderNo = e.dataTransfer.getData('text/plain') || draggedOrderNo;
    setDraggedOrderNo(null);

    if (!orderNo) return;

    const order = activeOrders.find((o) => o.orderNumber === orderNo);
    if (!order) return;
    if (order.status === targetStatus) return;

    try {
      await onStatusChange(orderNo, targetStatus);
      setSuccessPulse({ orderNo, colId: targetStatus });
      addToast(`Order ${orderNo} moved to ${targetStatus.replace(/_/g, ' ')}`, 'success');
      setTimeout(() => setSuccessPulse(null), 1500);
    } catch (err) {
      addToast(`Failed to move order ${orderNo}`, 'error');
    }
  };

  // Age calculation helper (returns color and duration text)
  const getAgeConfig = (placedAtStr: string) => {
    const elapsedMs = Date.now() - new Date(placedAtStr).getTime();
    const elapsedMin = Math.floor(elapsedMs / 60000);

    if (elapsedMin < 10) {
      return { bg: 'bg-[#16A34A]/10 text-[#16A34A]', label: `${elapsedMin}m ago`, pulse: false };
    } else if (elapsedMin < 20) {
      return { bg: 'bg-[#CA8A04]/10 text-[#CA8A04]', label: `${elapsedMin}m ago`, pulse: false };
    } else {
      return { bg: 'bg-[#DC2626]/10 text-[#DC2626]', label: `${elapsedMin}m ago!`, pulse: true };
    }
  };

  return (
    <div className="w-full flex flex-col h-full animate-fade-in select-none">
      {/* Top Navbar Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
            Live Kitchen Board
          </h1>
          <p className="text-sm text-text-secondary">
            Drag and drop cards or click quick-advance buttons to route orders through production.
          </p>
        </div>
        <Button variant="custom" size="none"           onClick={onBack}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-text-primary bg-[#FAFAFA] border border-border-subtle hover:bg-[#F5F5F5] rounded-full transition-all cursor-pointer"
        >
          ← Back to Orders Table
        </Button>
      </div>

      {/* Kanban Grid Container */}
      <div className="flex-1 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
        <div className="flex gap-4.5 min-w-[1100px] h-[calc(100vh-230px)]">
          {COLUMNS.map((column) => {
            const columnOrders = activeOrders.filter((o) => o.status === column.id);

            return (
              <div
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`
                  flex-1 flex flex-col h-full rounded-[22px] border border-border-subtle/50 overflow-hidden transition-all duration-300
                  ${column.bg} ${column.border} border-t-4
                  ${draggedOrderNo ? 'ring-2 ring-accent-primary/10 bg-accent-primary/[0.01]' : ''}
                `}
              >
                {/* Column Header */}
                <div className="px-4.5 py-4 bg-white/70 backdrop-blur-md flex items-center justify-between border-b border-border-subtle/25">
                  <span className="font-poppins font-bold text-sm text-text-primary">
                    {column.label}
                  </span>
                  <span
                    className="text-xs font-bold text-white rounded-full h-5 px-2.5 flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: column.color }}
                  >
                    {columnOrders.length}
                  </span>
                </div>

                {/* Column Content Cards Area */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-none">
                  <AnimatePresence>
                    {columnOrders.map((order) => {
                      const age = getAgeConfig(order.placedAt);
                      const isDragged = draggedOrderNo === order.orderNumber;
                      const hasSuccess =
                        successPulse?.orderNo === order.orderNumber &&
                        successPulse?.colId === column.id;

                      return (
                        <motion.div
                          key={order.orderNumber}
                          layoutId={`card-${order.orderNumber}`}
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -15, scale: 0.95 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, order.orderNumber)}
                          className={`
                            relative bg-white p-4 rounded-2xl border border-border-subtle/30 cursor-grab active:cursor-grabbing hover:shadow-button select-none transition-all duration-200
                            ${isDragged ? 'opacity-30 border-dashed border-accent-primary' : ''}
                            ${hasSuccess ? 'ring-2 ring-accent-primary bg-accent-tint-bg animate-pulse' : ''}
                            ${age.pulse ? 'ring-1 ring-red-500/20 border-red-200 shadow-lg shadow-red-500/[0.02] animate-pulse-slow' : ''}
                          `}
                        >
                          {/* Card Grip / Timer Line */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono font-bold text-[11px] text-text-secondary tracking-wider bg-[#FAFAFA] border border-border-subtle/40 px-2 py-0.5 rounded-full">
                              {order.orderNumber.split('-').pop()}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Duration Tag */}
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${age.bg}`}>
                                <Clock size={10} />
                                {age.label}
                              </span>
                              <GripVertical size={13} className="text-text-secondary/40 cursor-grab" />
                            </div>
                          </div>

                          {/* Customer Name */}
                          <h4 className="font-poppins font-bold text-sm text-text-primary mb-1">
                            {order.customer.name}
                          </h4>

                          {/* Summary text of items */}
                          <p className="text-xs text-text-secondary font-medium line-clamp-2 mb-3.5 leading-relaxed">
                            {order.items.map((it) => `${it.qty}× ${it.name}`).join(', ')}
                          </p>

                          {/* Delivery Type Area & Next Button */}
                          <div className="flex items-center justify-between pt-3 border-t border-border-subtle/10">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                              {order.delivery.type === 'DELIVERY' ? (
                                <>
                                  <MapPin size={10} className="text-[#2563EB]" />
                                  <span className="text-[#2563EB]">{order.delivery.area || 'Karachi'}</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={10} className="text-[#4F46E5]" />
                                  <span className="text-[#4F46E5]">Pickup</span>
                                </>
                              )}
                            </span>

                            {/* Quick advance status buttons */}
                            {column.id !== 'DELIVERED' && (
                              <Button variant="custom" size="none"                                 onClick={async () => {
                                  const idx = COLUMNS.findIndex((c) => c.id === column.id);
                                  const nextStatus = COLUMNS[idx + 1].id;
                                  try {
                                    await onStatusChange(order.orderNumber, nextStatus);
                                    addToast(`Order ${order.orderNumber} advanced to ${nextStatus.replace(/_/g, ' ')}`, 'success');
                                  } catch (err) {
                                    addToast('Failed to advance order', 'error');
                                  }
                                }}
                                className="w-6 h-6 rounded-full bg-accent-tint-bg hover:bg-accent-primary text-accent-primary hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                              >
                                {column.id === 'PREPARING' ? <CheckCircle2 size={13} /> : <Play size={10} />}
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {columnOrders.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border-subtle/30 rounded-2xl text-text-secondary/35 min-h-[140px] select-none">
                      <ShoppingBag size={24} className="mb-2 opacity-35" />
                      <span className="text-xs font-semibold">Column Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
