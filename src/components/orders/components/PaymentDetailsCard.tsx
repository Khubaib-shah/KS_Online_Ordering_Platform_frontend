import React from 'react';
import { CreditCard } from 'lucide-react';
import { Order } from '@/types/order';

interface PaymentDetailsCardProps {
  order: Order;
}

export function PaymentDetailsCard({ order }: PaymentDetailsCardProps) {
  return (
    <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-5 text-left">
      <h3 className="font-poppins font-bold text-sm text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle/10 pb-3">
        <CreditCard size={16} className="text-[#16A34A]" />
        Payment Details
      </h3>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Method</span>
            <span className="block text-xs font-bold text-text-primary mt-0.5 capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider text-right">Status</span>
            <span className={`block text-xs font-bold mt-0.5 text-right ${order.paymentStatus === 'PAID' ? 'text-[#16A34A]' : 'text-[#CA8A04]'}`}>
              ● {order.paymentStatus}
            </span>
          </div>
        </div>

        {order.transactionId && (
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Transaction / Reference ID</span>
            <span className="block font-mono text-xs font-semibold text-text-primary mt-0.5 select-all bg-slate-50 border border-border-subtle/25 p-1.5 rounded-lg truncate">
              {order.transactionId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
