import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PromoCode } from '@/types/promo';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';

interface PromoModalProps {
  promo?: PromoCode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: PromoCode) => Promise<any>;
}

export function PromoModal({ promo, isOpen, onClose, onSave }: PromoModalProps) {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'flat_percent' | 'flat_amount' | 'free_delivery'>('flat_percent');
  const [value, setValue] = useState<number>(0);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [maxDiscountCap, setMaxDiscountCap] = useState<number>(0);
  const [validFrom, setValidFrom] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (promo) {
      setCode(promo.code);
      setType(promo.type);
      setValue(promo.value);
      setMinOrderValue(promo.minOrderValue || 0);
      setMaxDiscountCap(promo.maxDiscountCap || 0);
      setUsageLimit(promo.usageLimit || 0);
      setUsageCount(promo.usageCount || 0);
      setValidFrom(promo.validFrom ? promo.validFrom.slice(0, 10) : '');
      setExpiresAt(promo.expiresAt ? promo.expiresAt.slice(0, 10) : '');
      setIsActive(promo.isActive);
    } else {
      setCode('');
      setType('flat_percent');
      setValue(0);
      setMinOrderValue(0);
      setMaxDiscountCap(0);
      setUsageLimit(0);
      setUsageCount(0);
      setValidFrom('');
      setExpiresAt('');
      setIsActive(true);
    }
  }, [promo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isSaving) return;

    setIsSaving(true);
    const promoPayload: PromoCode = {
      id: promo?.id || `promo-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
      maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usageCount,
      validFrom: validFrom ? new Date(validFrom).toISOString() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      isActive
    };

    try {
      await onSave(promoPayload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" onClick={onClose} />

      {/* Main Container: Mobile Bottom Sheet, Desktop Centered Card */}
      <div className={cn(
        "relative bg-white w-full flex flex-col overflow-hidden shadow-2xl select-none transition-all duration-300",
        // Mobile / Small Screen: Bottom Sheet Layout
        "fixed bottom-0 left-0 right-0 rounded-t-[20px] rounded-b-none border-t border-slate-200 max-h-[90vh] flex flex-col",
        // Desktop Screen: Centered Modal Card Layout
        "md:relative md:bottom-auto md:left-auto md:right-auto md:my-auto md:max-w-md md:rounded-[20px] md:border md:max-h-[85vh] md:h-auto"
      )}>

        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between border-b border-border-subtle p-2 sm:p-4 md:p-6 pb-4 shrink-0 bg-white z-20">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-accent-tint-bg text-accent-primary rounded-xl flex items-center justify-center border border-accent-light/30 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-base md:text-lg text-text-primary leading-tight">
                {promo ? 'Modify Promo Code' : 'Add Promo Code'}
              </h3>
              <p className="text-[10px] md:text-[11px] text-text-secondary font-normal mt-0.5">
                Set up discounts and promotional codes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border-subtle hover:border-slate-300 hover:bg-surface-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 flex flex-col gap-4 scrollbar-none">

            {/* Coupon Code */}
            <div className="text-left">
              <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                Discount Code Name *
              </label>
              <Input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. KARAHI25, INDOLJ500"
              />
            </div>

            {/* Type and Value Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Reduction Type
                </label>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full text-xs font-semibold text-text-primary h-11 bg-white border border-border-subtle rounded-xl px-4 focus:outline-none focus:border-accent-primary cursor-pointer shadow-xs"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Rupees (Rs.)</option>
                </Select>
              </div>
              <div className="text-left">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Reduction Value *
                </label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={value || ''}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder="e.g. 15 or 500"
                />
              </div>
            </div>

            {/* Limits and Minimum order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Min. Order Total (Rs.)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={minOrderValue || ''}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  placeholder="e.g. 1000"
                />
              </div>
              <div className="text-left">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Max Usage Limit
                </label>
                <Input
                  type="number"
                  min={0}
                  value={usageLimit || ''}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  placeholder="0 for unlimited"
                />
              </div>
            </div>

            {/* Max Discount Cap */}
            {type === 'flat_percent' && (
              <div className="text-left">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Max Discount Cap (Rs.)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={maxDiscountCap || ''}
                  onChange={(e) => setMaxDiscountCap(Number(e.target.value))}
                  placeholder="e.g. 500"
                />
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Start Date
                </label>
                <DatePicker
                  mode="single"
                  value={validFrom ? new Date(validFrom) : undefined}
                  onChange={(val) => setValidFrom(val ? format(val as Date, 'yyyy-MM-dd') : '')}
                  placeholder="Select start date"
                />
              </div>
              <div className="text-left">
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Expiration Date
                </label>
                <DatePicker
                  mode="single"
                  value={expiresAt ? new Date(expiresAt) : undefined}
                  onChange={(val) => setExpiresAt(val ? format(val as Date, 'yyyy-MM-dd') : '')}
                  placeholder="Select expiration"
                />
              </div>
            </div>

            {/* Active website switch */}
            <div className="flex items-center justify-between py-3 border-t border-border-subtle mt-2">
              <div className="text-left">
                <span className="text-xs font-medium text-text-primary block">Active Website Use</span>
                <span className="text-[10px] text-text-secondary font-normal block mt-0.5">If disabled, this coupon cannot be applied.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
              </label>
            </div>

          </div>

          {/* Sticky Modal Footer */}
          <div className="flex justify-end gap-3 p-2 sm:p-4 md:p-5 border-t border-border-subtle shrink-0 bg-white z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-10 text-xs font-medium text-text-secondary bg-surface-muted border border-border-subtle hover:bg-surface-hover hover:text-text-primary rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 h-10 text-xs font-bold text-white bg-accent-primary hover:bg-accent-dark rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-button"
            >
              {isSaving ? 'Saving...' : 'Save Promo'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
