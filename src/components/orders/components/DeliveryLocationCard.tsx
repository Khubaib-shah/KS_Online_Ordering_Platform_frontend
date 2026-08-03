import React from 'react';
import { MapPin } from 'lucide-react';
import { Order } from '@/types/order';

interface DeliveryLocationCardProps {
  order: Order;
}

export function DeliveryLocationCard({ order }: DeliveryLocationCardProps) {
  return (
    <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-5 text-left">
      <h3 className="font-poppins font-bold text-sm text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle/10 pb-3">
        <MapPin size={16} className="text-[#2563EB]" />
        Delivery Location
      </h3>

      <div className="flex flex-col gap-3.5">
        <div>
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Service Type</span>
          <span className={`block text-xs font-bold mt-0.5 ${order.delivery.type === 'DELIVERY' ? 'text-[#2563EB]' : 'text-[#4F46E5]'}`}>
            {order.delivery.type}
          </span>
        </div>

        {order.delivery.type === 'DELIVERY' ? (
          <>
            <div>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Karachi Area</span>
              <span className="block text-xs font-bold text-text-primary mt-0.5">{order.delivery.area || 'Karachi Central'}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Drop Address</span>
              <span className="block text-xs font-medium text-text-primary leading-relaxed mt-1 bg-slate-50 border border-border-subtle/25 rounded-xl p-2.5">
                {order.delivery.address}
              </span>
            </div>
          </>
        ) : (
          <div className="bg-purple-50/55 border border-purple-200/40 rounded-xl p-3 text-xs font-semibold text-[#4F46E5] leading-relaxed">
            Customer will self-pickup this order from DHA Phase 5 outlet. No shipping address required.
          </div>
        )}
      </div>
    </div>
  );
}
