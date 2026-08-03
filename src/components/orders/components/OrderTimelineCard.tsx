import { Select } from '../../ui/Select';
import React from 'react';
import { Input } from '../../ui/Input';
import { History } from 'lucide-react';
import { Order } from '../../../types/order';

interface OrderTimelineCardProps {
  order: Order;
}

export function OrderTimelineCard({ order }: OrderTimelineCardProps) {
  return (
    <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-6 text-left">
      <h3 className="font-poppins font-bold text-base text-text-primary mb-5 flex items-center gap-2">
        <History size={18} className="text-text-secondary" />
        Order Timeline & Activity
      </h3>

      <div className="relative pl-6.5 border-l-2 border-[#0E4B3E]/10 flex flex-col gap-6 ml-2 pt-1 pb-1">
        {order.timeline.map((evt, idx) => (
          <div key={idx} className="relative group/time select-none">
            {/* Outer circle dot */}
            <div className="absolute -left-[33px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-accent-primary ring-4 ring-white shadow-sm transition-transform group-hover/time:scale-125 duration-150" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-text-primary capitalize bg-slate-50 border border-border-subtle/30 px-2 py-0.5 rounded-full">
                  {evt.status.replace(/_/g, ' ')}
                </span>
                {evt.note && (
                  <p className="text-xs text-text-secondary font-medium mt-1.5 pl-1 leading-relaxed">
                    {evt.note}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-semibold text-text-secondary/50 shrink-0 mt-0.5">
                {new Date(evt.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
