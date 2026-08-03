import { Select } from '../../ui/Select';
import React from 'react';
import { Input } from '../../ui/Input';
import { Hash, StickyNote } from 'lucide-react';
import { Order } from '../../../types/order';

interface OrderItemsCardProps {
  order: Order;
}

export function OrderItemsCard({ order }: OrderItemsCardProps) {
  const totalQty = order.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-6 overflow-hidden">
      <h3 className="font-poppins font-bold text-base text-[#0E4B3E] mb-4 flex items-center gap-2 text-left">
        <Hash size={18} className="text-[#0E4B3E]/60" />
        Order Items ({totalQty})
      </h3>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full border-collapse min-w-[400px]">
          <thead>
            <tr className="border-b border-border-subtle/15 pb-2 text-left">
              <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider">Item Details</th>
              <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider text-center px-3 whitespace-nowrap">Qty</th>
              <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right px-3 whitespace-nowrap">Unit Price</th>
              <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right pl-3 whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border-subtle/10 py-3.5 text-left">
                <td className="py-3.5 pr-4">
                  <div className="flex flex-col">
                    <span className="font-poppins font-bold text-sm text-text-primary">{item.name}</span>
                    {/* Selected Variants */}
                    {item.selectedVariants && item.selectedVariants.length > 0 && (
                      <span className="text-[11px] text-accent-primary font-medium mt-0.5">
                        {item.selectedVariants.map((v) => `${v.groupName}: ${v.optionName}`).join(' | ')}
                      </span>
                    )}
                    {/* Instructions */}
                    {item.instructions && (
                      <span className="inline-flex items-start gap-1 text-[11px] text-[#CA8A04] mt-1 bg-[#CA8A04]/5 px-2 py-0.5 rounded-lg border border-[#CA8A04]/10 w-fit">
                        <StickyNote size={10} className="mt-0.5" />
                        <span className="italic">Note: "{item.instructions}"</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 text-center text-sm font-bold text-text-primary whitespace-nowrap px-3">
                  ×{item.qty}
                </td>
                <td className="py-3.5 text-right text-sm font-semibold text-text-secondary whitespace-nowrap px-3">
                  Rs. {item.unitPrice.toLocaleString()}
                </td>
                <td className="py-3.5 text-right text-sm font-bold text-text-primary whitespace-nowrap pl-3">
                  Rs. {item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Price Calculations */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs flex flex-col gap-2 border-t border-border-subtle/15 pt-4 text-left">
          <div className="flex justify-between text-xs text-text-secondary font-semibold">
            <span>Subtotal</span>
            <span>Rs. {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-text-secondary font-semibold">
            <span>GST/Tax (13%)</span>
            <span>Rs. {order.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-text-secondary font-semibold">
            <span>Delivery Fee</span>
            <span>Rs. {order.deliveryFee.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-xs text-[#DC2626] font-semibold bg-red-50/50 px-2 py-1 rounded">
              <span>Discount</span>
              <span>-Rs. {order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-text-primary border-t border-border-subtle/15 pt-2.5">
            <span className="text-[#0E4B3E]">Grand Total</span>
            <span className="text-[#0E4B3E]">Rs. {order.grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
