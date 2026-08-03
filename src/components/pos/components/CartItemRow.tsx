import React, { useState } from 'react';import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';
import { Trash2, Plus, Minus, MessageSquare, Edit3 } from 'lucide-react';

export interface CartItem {
  id: string; // generated unique id (id + selection fingerprint)
  productId: string;
  name: string;
  basePrice: number;
  addedPrice: number; // sum of additional prices from choices
  qty: number;
  selectedVariants: { groupName: string; optionName: string; additionalPrice: number }[];
  instructions?: string;
  thumbnail?: string;
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (itemId: string, newQty: number) => void;
  onRemove: (itemId: string) => void;
  onUpdateInstructions: (itemId: string, text: string) => void;
  key?: string | number;
}

export function CartItemRow({ item, onUpdateQty, onRemove, onUpdateInstructions }: CartItemRowProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteValue, setNoteValue] = useState(item.instructions || '');

  const itemPrice = item.basePrice + item.addedPrice;
  const lineTotal = itemPrice * item.qty;

  const handleSaveNote = () => {
    onUpdateInstructions(item.id, noteValue);
    setShowNoteInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveNote();
    }
  };

  return (
    <div className="border-b border-border-subtle/70 pb-3 last:border-b-0 last:pb-0 flex flex-col gap-2 select-none group">

      {/* Primary Row Content */}
      <div className="flex items-start gap-3 justify-between">

        {/* Info Column */}
        <div className="flex-1 min-w-0 text-left">
          <span className="font-poppins font-bold text-xs sm:text-sm text-text-primary block line-clamp-2 leading-snug">
            {item.name}
          </span>

          {/* Render selected variants/addons if any */}
          {item.selectedVariants.length > 0 && (
            <p className="text-[10px] text-text-secondary mt-0.5 font-medium leading-relaxed">
              {item.selectedVariants.map((v) => `${v.optionName}`).join(', ')}
            </p>
          )}

          {/* Render custom note if saved */}
          {item.instructions && (
            <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 inline-block mt-1 max-w-full truncate font-medium">
              Note: {item.instructions}
            </p>
          )}
        </div>

        {/* Pricing Info */}
        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-bold text-text-primary block font-mono">
            Rs. {lineTotal.toLocaleString()}
          </span>
          {item.qty > 1 && (
            <span className="text-[10px] text-text-secondary font-mono">
              Rs. {itemPrice.toLocaleString()} × {item.qty}
            </span>
          )}
        </div>

      </div>

      {/* Row Control Actions Footer */}
      <div className="flex items-center justify-between gap-3 bg-surface-muted/30 hover:bg-surface-muted/75 transition-colors px-2 py-1.5 rounded-lg border border-border-subtle/40">

        {/* Note button */}
        <Button variant="custom" size="none"           onClick={() => setShowNoteInput(!showNoteInput)}
          className={`
            flex items-center gap-1.5 text-[10px] font-semibold rounded-md px-2 py-1 border transition-all cursor-pointer
            ${item.instructions
              ? 'bg-amber-50 border-amber-100 text-amber-700'
              : 'bg-white border-border-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary'
            }
          `}
        >
          <MessageSquare size={11} />
          <span>{item.instructions ? 'Edit Note' : 'Add Note'}</span>
        </Button>

        <div className="flex items-center gap-3.5 ml-auto">
          {/* Quantity selector */}
          <div className="flex items-center bg-white border border-border-subtle rounded-lg h-7 overflow-hidden shadow-xs shrink-0 select-none">
            <Button variant="custom" size="none"               onClick={() => onUpdateQty(item.id, item.qty - 1)}
              className="w-7 h-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors font-bold text-xs select-none cursor-pointer"
            >
              <Minus size={11} />
            </Button>
            <span className="w-8 text-center text-xs font-bold text-text-primary font-mono">
              {item.qty}
            </span>
            <Button variant="custom" size="none"               onClick={() => onUpdateQty(item.id, item.qty + 1)}
              className="w-7 h-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors font-bold text-xs select-none cursor-pointer"
            >
              <Plus size={11} />
            </Button>
          </div>

          {/* Remove Item */}
          <Button variant="custom" size="none"             onClick={() => onRemove(item.id)}
            className="text-text-secondary hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            title="Remove item"
          >
            <Trash2 size={13} />
          </Button>
        </div>

      </div>

      {/* Slide down quick note writing area */}
      {showNoteInput && (
        <div className="flex items-center gap-1.5 bg-white border border-border-subtle rounded-lg p-1.5 mt-1 shadow-sm">
          <Input
            type="text"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g. No onions, extra spicy..."

            autoFocus
          />
          <Button variant="custom" size="none"             onClick={handleSaveNote}
            className="px-2.5 h-7 bg-accent-primary hover:bg-accent-dark text-white rounded-md text-[10px] font-bold shadow-xs cursor-pointer flex items-center justify-center"
          >
            Save
          </Button>
          <Button variant="custom" size="none"             onClick={() => setShowNoteInput(false)}
            className="px-2 h-7 bg-surface-muted hover:bg-surface-hover text-text-secondary hover:text-text-primary rounded-md text-[10px] font-bold border border-border-subtle cursor-pointer flex items-center justify-center"
          >
            Cancel
          </Button>
        </div>
      )}

    </div>
  );
}
