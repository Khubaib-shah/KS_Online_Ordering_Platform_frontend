import { Select } from '../../ui/Select';
import React from 'react';
import { Input } from '../../ui/Input';
import { User, Phone, Mail } from 'lucide-react';
import { Order } from '../../../types/order';

interface CustomerProfileCardProps {
  order: Order;
}

export function CustomerProfileCard({ order }: CustomerProfileCardProps) {
  return (
    <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-5 text-left">
      <h3 className="font-poppins font-bold text-sm text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle/10 pb-3">
        <User size={16} className="text-text-secondary" />
        Customer Profile
      </h3>

      <div className="flex flex-col gap-3.5">
        <div>
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Full Name</span>
          <span className="block text-sm font-bold text-text-primary mt-0.5">{order.customer.name}</span>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Phone</span>
            <a href={`tel:${order.customer.phone}`} className="block text-xs font-semibold text-accent-primary hover:underline mt-0.5 flex items-center gap-1">
              <Phone size={12} />
              {order.customer.phone}
            </a>
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Email</span>
            {order.customer.email ? (
              <a href={`mailto:${order.customer.email}`} className="block text-xs font-semibold text-accent-primary hover:underline mt-0.5 truncate flex items-center gap-1">
                <Mail size={12} />
                {order.customer.email}
              </a>
            ) : (
              <span className="block text-xs text-text-secondary/40 mt-0.5 italic">None Provided</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
