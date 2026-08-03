import { Select } from '../../ui/Select';import { Button } from '@/components/ui/Button';

import React from 'react';
import { Input } from '../../ui/Input';
import { CartItem, CartItemRow } from './CartItemRow';
import { ShoppingCart, Trash } from 'lucide-react';

interface CartSectionProps {
  items: CartItem[];
  onUpdateQty: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateInstructions: (itemId: string, text: string) => void;
  onClearCart: () => void;
}

export function CartSection({
  items,
  onUpdateQty,
  onRemoveItem,
  onUpdateInstructions,
  onClearCart,
}: CartSectionProps) {
  const isCartEmpty = items.length === 0;

  return (
    <div className="flex flex-col h-full bg-white select-none border border-border-subtle rounded-xl overflow-hidden shadow-card">
      
      {/* Cart Title Bar */}
      <div className="px-4 py-3.5 bg-surface-muted/30 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2 text-left">
          <ShoppingCart size={15} className="text-accent-primary" />
          <h2 className="font-poppins font-bold text-xs sm:text-sm text-text-primary uppercase tracking-wider">
            Current Cart ({items.reduce((total, i) => total + i.qty, 0)})
          </h2>
        </div>

        {!isCartEmpty && (
          <Button variant="custom" size="none"             onClick={onClearCart}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-text-secondary hover:text-red-600 transition-colors cursor-pointer hover:bg-red-50 px-2 py-1 rounded-md"
          >
            <Trash size={11} />
            <span>Clear</span>
          </Button>
        )}
      </div>

      {/* Cart Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isCartEmpty ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary select-none min-h-[180px]">
            <div className="w-10 h-10 rounded-full bg-surface-muted border border-border-subtle flex items-center justify-center mb-3">
              <ShoppingCart size={16} className="text-text-secondary" />
            </div>
            <h5 className="font-poppins font-bold text-text-primary text-xs uppercase tracking-wider">Cart is empty</h5>
            <p className="text-[10px] text-text-secondary mt-1 leading-relaxed max-w-[180px] mx-auto">
              Select or search items from the catalog to add them to this sale.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQty={onUpdateQty}
              onRemove={onRemoveItem}
              onUpdateInstructions={onUpdateInstructions}
            />
          ))
        )}
      </div>

    </div>
  );
}
