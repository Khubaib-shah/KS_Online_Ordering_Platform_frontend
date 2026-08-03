import { Select } from '../../ui/Select';import { Button } from '@/components/ui/Button';

import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { MenuItem, VariantGroup, VariantOption } from '../../../types/menu';
import { X, Check } from 'lucide-react';

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MenuItem;
  onConfirm: (selectedOptions: { groupName: string; optionName: string; additionalPrice: number }[]) => void;
}

export function VariantSelectionModal({ isOpen, onClose, product, onConfirm }: VariantSelectionModalProps) {
  const groups: VariantGroup[] = (product.variantGroups || product.variants || []) as VariantGroup[];
  
  // Keep track of selected options for each group
  // For each group name, store an array of chosen option names
  const [selections, setSelections] = useState<Record<string, VariantOption[]>>(() => {
    const initial: Record<string, VariantOption[]> = {};
    groups.forEach((g) => {
      // If required, we can pre-select the first option
      if (g.required && g.options.length > 0) {
        initial[g.name] = [g.options[0]];
      } else {
        initial[g.name] = [];
      }
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleSelectOption = (group: VariantGroup, option: VariantOption) => {
    const groupName = group.name;
    const isSingleSelect = (group.max || 1) === 1;

    setSelections((prev) => {
      const current = prev[groupName] || [];
      if (isSingleSelect) {
        return { ...prev, [groupName]: [option] };
      } else {
        // Toggle option
        const exists = current.some((o) => o.name === option.name);
        let updated: VariantOption[];
        if (exists) {
          updated = current.filter((o) => o.name !== option.name);
        } else {
          // Check max limit
          const maxLimit = group.max || Infinity;
          if (current.length < maxLimit) {
            updated = [...current, option];
          } else {
            // Replace the oldest or do nothing (we will swap if max is exceeded)
            updated = [...current.slice(1), option];
          }
        }
        return { ...prev, [groupName]: updated };
      }
    });
  };

  const handleConfirm = () => {
    // Flatten selections into simple selection object
    const result: { groupName: string; optionName: string; additionalPrice: number }[] = [];
    (Object.entries(selections) as [string, VariantOption[]][]).forEach(([groupName, options]) => {
      options.forEach((opt) => {
        result.push({
          groupName,
          optionName: opt.name,
          additionalPrice: opt.additionalPrice || opt.price || 0,
        });
      });
    });
    onConfirm(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 select-none animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-card border border-border-subtle flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-muted">
          <div className="text-left">
            <h3 className="font-poppins font-bold text-base text-text-primary">Customize Item</h3>
            <p className="text-xs text-text-secondary mt-0.5">{product.name}</p>
          </div>
          <Button variant="custom" size="none" 
            onClick={onClose}
            className="p-1.5 hover:bg-surface-hover rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {groups.map((group) => {
            const isSingleSelect = (group.max || 1) === 1;
            const chosen = selections[group.name] || [];
            
            return (
              <div key={group.name} className="space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-poppins font-bold text-sm text-text-primary">
                    {group.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {group.required ? (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-text-secondary/5 text-text-secondary/80 border border-border-subtle px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Optional
                      </span>
                    )}
                    <span className="text-[10px] text-text-secondary">
                      {isSingleSelect ? 'Choose 1' : `Max ${group.max || 'any'}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((option) => {
                    const isSelected = chosen.some((o) => o.name === option.name);
                    const extraPrice = option.additionalPrice || option.price || 0;
                    
                    return (
                      <Button variant="custom" size="none"                         key={option.name}
                        onClick={() => handleSelectOption(group, option)}
                        className={`
                          p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-98
                          ${
                            isSelected
                              ? 'border-accent-primary bg-accent-tint-bg text-accent-primary font-semibold'
                              : 'border-border-subtle hover:bg-surface-hover hover:border-text-secondary/20 text-text-secondary hover:text-text-primary'
                          }
                        `}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{option.name}</span>
                          {extraPrice > 0 && (
                            <span className="text-[10px] font-bold text-accent-primary mt-0.5">
                              + Rs. {extraPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center text-white shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-muted flex items-center justify-end gap-3">
          <Button variant="custom" size="none"             onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary bg-white border border-border-subtle hover:bg-surface-hover transition-colors cursor-pointer"
          >
            Cancel
          </Button>
          <Button variant="custom" size="none"             onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent-primary hover:bg-accent-dark shadow-button transition-colors cursor-pointer"
          >
            Add to Transaction
          </Button>
        </div>

      </div>
    </div>
  );
}
