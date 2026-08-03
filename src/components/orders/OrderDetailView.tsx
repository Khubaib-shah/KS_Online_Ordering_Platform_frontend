import { Select } from '../ui/Select';import { Button } from '@/components/ui/Button';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { useOrderDetail } from '../../hooks/useOrderDetail';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusDropdown } from './OrderStatusDropdown';
import { PrintReceiptButton } from './PrintReceiptButton';
import { PrintButton } from '../receipt/PrintButton';
import { useUIStore } from '../../store/uiStore';;
import {
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

import { OrderItemsCard } from './components/OrderItemsCard';
import { OrderTimelineCard } from './components/OrderTimelineCard';
import { CustomerProfileCard } from './components/CustomerProfileCard';
import { DeliveryLocationCard } from './components/DeliveryLocationCard';
import { PaymentDetailsCard } from './components/PaymentDetailsCard';
import { PrivateKitchenNotesCard } from './components/PrivateKitchenNotesCard';
import { CancelOrderModal } from './components/CancelOrderModal';

interface OrderDetailViewProps {
  orderNumber: string;
  onBack: () => void;
}

export function OrderDetailView({ orderNumber, onBack }: OrderDetailViewProps) {
    const { addToast } = useUIStore();;
  const { order, isLoading, updateStatus, cancelOrder, addNote } = useOrderDetail(orderNumber);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-[#0E4B3E]/10 border-t-[#0E4B3E] animate-spin mb-4" />
        <span className="text-sm font-semibold text-text-secondary">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 animate-fade-in select-none">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4">
          <AlertTriangle size={28} />
        </div>
        <h3 className="font-poppins font-bold text-lg text-text-primary mb-1">Order Not Found</h3>
        <p className="text-text-secondary text-sm max-w-xs text-center mb-6">
          The order number "{orderNumber}" could not be retrieved from the database.
        </p>
        <Button variant="custom" size="none"           onClick={onBack}
          className="px-5 py-2 text-xs font-semibold text-white bg-accent-primary hover:bg-accent-dark rounded-full transition-all cursor-pointer"
        >
          ← Go Back to Orders
        </Button>
      </div>
    );
  }

  const handleCancelSubmit = async (reason: string) => {
    try {
      await cancelOrder(reason);
      addToast(`Order ${orderNumber} cancelled.`, 'success');
      setShowCancelModal(false);
    } catch (err) {
      addToast('Failed to cancel order', 'error');
    }
  };

  return (
    <div className="w-full flex flex-col animate-fade-in select-none pb-12">
      {/* Header and Back Button Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 border-b border-border-subtle/15 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="custom" size="none"             onClick={onBack}
            className="w-10 h-10 rounded-full border border-border-subtle/40 hover:bg-[#FAFAFA] flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm active:scale-90"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-poppins font-bold text-xl md:text-2xl text-text-primary tracking-tight">
                Order {order.orderNumber.split('-').pop()}
              </h1>
              <OrderStatusBadge status={order.status} size="sm" />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Placed on {new Date(order.placedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <PrintReceiptButton orderNumber={order.orderNumber} order={order} />
          <PrintButton orderNumber={order.orderNumber} defaultBranchId={order.branchId} />

          {/* Quick status change */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-semibold">Change Status:</span>
            <OrderStatusDropdown
              currentStatus={order.status}
              onStatusChange={async (nextStatus) => {
                await updateStatus(nextStatus);
                addToast(`Status updated to ${nextStatus.replace(/_/g, ' ')}`, 'success');
              }}
            />
          </div>

          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button variant="custom" size="none"               onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100/75 rounded-full transition-all border border-red-200/50 cursor-pointer"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6.5">
        
        {/* LEFT COLUMN: Items & Timeline (takes 2/3 space) */}
        <div className="lg:col-span-2 flex flex-col gap-6.5">
          {/* 1. Items List Card */}
          <OrderItemsCard order={order} />

          {/* 2. Operations Activity Timeline */}
          <OrderTimelineCard order={order} />
        </div>

        {/* RIGHT COLUMN: Customer, Delivery, Payment, Notes (takes 1/3 space) */}
        <div className="flex flex-col gap-6.5">
          {/* 1. Customer Profile Card */}
          <CustomerProfileCard order={order} />

          {/* 2. Delivery Coordinate Card */}
          <DeliveryLocationCard order={order} />

          {/* 3. Payment Gateway Card */}
          <PaymentDetailsCard order={order} />

          {/* 4. Private Team Discussion Notes Card */}
          <PrivateKitchenNotesCard
            order={order}
            addNote={addNote}
            addToast={addToast}
          />
        </div>

      </div>

      {/* Cancel Confirmation Modal Dialog */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSubmit={handleCancelSubmit}
      />
    </div>
  );
}
