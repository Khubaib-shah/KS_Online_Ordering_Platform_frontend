import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InputField } from '@/components/ui/forms/InputField';
import Checkbox from '@/components/ui/Checkbox';
import { CreditCard, Wallet, Landmark, HelpCircle, BadgePercent, User, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useTenantStore } from '@/store/tenantStore';

interface PaymentSectionProps {
  subtotal: number;
  discount: number;
  onUpdateDiscount: (val: number) => void;
  tax: number; // calculated 15%
  grandTotal: number;
  paymentMethod: string;
  onSelectPaymentMethod: (method: any) => void;
  cashReceived: number;
  onUpdateCashReceived: (val: number) => void;
  changeAmount: number;
  onCompleteSale: (customerName: string, customerPhone: string, fulfillmentType: string, address: string) => void;
  isCartEmpty: boolean;
  isSubmitting?: boolean;
}

export function PaymentSection({
  subtotal,
  discount,
  onUpdateDiscount,
  tax,
  grandTotal,
  paymentMethod,
  onSelectPaymentMethod,
  cashReceived,
  onUpdateCashReceived,
  changeAmount,
  onCompleteSale,
  isCartEmpty,
  isSubmitting,
}: PaymentSectionProps) {
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'TAKEAWAY' | 'DELIVERY'>('TAKEAWAY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [hasClickedQuickCash, setHasClickedQuickCash] = useState(false);

  const { activeTenant } = useTenantStore();
  const currencySymbol = activeTenant?.config?.currencySymbol || activeTenant?.currency || 'Rs.';

  // Auto-fill exact change when payment method switches or grand total changes
  useEffect(() => {
    if (paymentMethod === 'CASH' && cashReceived === 0 && grandTotal > 0) {
      onUpdateCashReceived(grandTotal);
      setHasClickedQuickCash(false);
    }
  }, [paymentMethod, grandTotal, cashReceived, onUpdateCashReceived]);

  const configMethods = activeTenant?.config?.paymentMethods || ['cash', 'card', 'mobile_pay'];

  const allMethods = [
    { id: 'CASH', label: 'Cash', icon: CreditCard, type: 'cash' },
    { id: 'CARD', label: 'Card / POS', icon: CreditCard, type: 'card' },
    { id: 'JAZZCASH', label: 'JazzCash', icon: Wallet, type: 'mobile_pay' },
    { id: 'EASYPAISA', label: 'Easypaisa', icon: Wallet, type: 'mobile_pay' },
    { id: 'BANK_TRANSFER', label: 'Bank Pay', icon: Landmark, type: 'mobile_pay' },
    { id: 'LOYALTY_POINTS', label: 'Loyalty Points', icon: BadgePercent, type: 'loyalty_points' },
    { id: 'OTHER', label: 'Other', icon: HelpCircle, type: 'other' },
  ];

  const paymentMethods = allMethods.filter(m => m.type === 'other' || configMethods.includes(m.type as any));

  const quickCashIncrements = [100, 500, 1000, 5000];

  const handleQuickCash = (amount: number) => {
    if (!hasClickedQuickCash || cashReceived === grandTotal || cashReceived === 0) {
      onUpdateCashReceived(amount);
      setHasClickedQuickCash(true);
    } else {
      onUpdateCashReceived(cashReceived + amount);
    }
  };

  const handleManualCashInput = (amount: number) => {
    onUpdateCashReceived(amount);
    setHasClickedQuickCash(false);
  };

  const handleCompleteTransaction = () => {
    onCompleteSale(customerName, customerPhone, fulfillmentType, deliveryAddress);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setFulfillmentType('TAKEAWAY');
  };

  return (
    <div className="flex flex-col gap-3 text-left select-none">

      {/* 1. Totals Summary Panel */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">

        {/* Subtotal Row */}
        <div className="flex items-center justify-between text-sm text-slate-600 font-medium">
          <span>Subtotal</span>
          <span className="font-mono">{currencySymbol} {subtotal.toLocaleString()}</span>
        </div>

        {/* Tax Row */}
        {tax > 0 && (
          <div className="flex items-center justify-between text-sm text-slate-600 font-medium">
            <span>GST Tax</span>
            <span className="font-mono">{currencySymbol} {tax.toLocaleString()}</span>
          </div>
        )}

        {/* Discount Row */}
        <div className="flex items-center justify-between gap-3 text-sm font-medium">
          <div className="flex items-center gap-2 text-slate-600">
            <BadgePercent size={16} className="text-accent-primary" />
            <span>Discount ({currencySymbol})</span>
          </div>
          <div className="relative w-24 text-right shrink-0">
            <Input
              type="number"
              min={0}
              max={subtotal}
              value={discount === 0 ? '' : discount}
              onChange={(e) => onUpdateDiscount(Number(e.target.value))}
              placeholder="0"
              className="text-center bg-white border-slate-200 font-medium h-9"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-center justify-between font-bold">
          <span className="text-base text-slate-900">Grand Total</span>
          <span className="font-mono text-lg text-slate-900 font-extrabold tracking-tight">
            {currencySymbol} {grandTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Customer Registry (Optional) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Button variant="custom" size="none" type="button"
          onClick={() => setShowCustomerDetails(!showCustomerDetails)}
          className="w-full px-4 py-3 bg-white flex items-center justify-between text-sm font-medium text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <span>Customer Info (Optional)</span>
            {(customerName || customerPhone) && (
              <span className="w-2 h-2 rounded-full bg-accent-primary" />
            )}
          </div>
          {showCustomerDetails ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </Button>

        {showCustomerDetails && (
          <div className="p-4 border-t border-slate-100 space-y-3 animate-fade-in bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Customer Name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ali Ahmed"
                className="bg-white"
              />

              <InputField
                label="Mobile Number"
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 03001234567"
                className="bg-white"
              />
            </div>

            {/* Fulfillment Selection */}
            <div className="flex gap-6 pt-2 pb-1">
              <Checkbox
                label={<span className="text-sm font-medium text-slate-700">Takeaway</span>}
                checked={fulfillmentType === 'TAKEAWAY'}
                onChange={() => setFulfillmentType('TAKEAWAY')}
              />
              <Checkbox
                label={<span className="text-sm font-medium text-slate-700">Delivery (Phone Order)</span>}
                checked={fulfillmentType === 'DELIVERY'}
                onChange={() => setFulfillmentType('DELIVERY')}
              />
            </div>

            {/* Address Field (only if Delivery) */}
            {fulfillmentType === 'DELIVERY' && (
              <div className="pt-1">
                <InputField
                  label="Delivery Address"
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, Apartment 4B"
                  className="bg-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Payment Method Grid */}
      <div className="space-y-2 mt-1">
        <label className="text-xs text-slate-600 font-extrabold uppercase tracking-wider block">
          Select Payment Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map((pm) => {
            const isSelected = paymentMethod === pm.id;
            return (
              <Button variant="custom" size="none" key={pm.id}
                onClick={() => onSelectPaymentMethod(pm.id)}
                className={`
                  px-2 py-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center
                  ${isSelected
                    ? 'border-accent-primary bg-accent-tint-bg text-accent-primary font-bold shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                <pm.icon size={16} className={isSelected ? 'text-accent-primary' : 'text-slate-500'} />
                <span className="text-xs font-bold tracking-tight whitespace-nowrap">{pm.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 4. Cash Tendered (Only if CASH is selected) */}
      {paymentMethod === 'CASH' && (
        <div className="bg-white border-2 border-amber-400 rounded-xl p-4 shadow-sm animate-in zoom-in-95 duration-200 flex-shrink-0 mt-4">
          <div className="flex justify-between items-end mb-3">
            <label className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Cash Received</label>
            <div className="text-right">
              <div className="text-[10px] font-bold text-amber-700/70 uppercase tracking-wider mb-0.5">Change Return</div>
              <div className={`font-mono text-xl font-black tracking-tight ${changeAmount > 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                {currencySymbol} {changeAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <InputField
              type="number"
              value={cashReceived === 0 ? '' : cashReceived}
              onChange={(e) => handleManualCashInput(Number(e.target.value))}
              placeholder="0"
              className="text-lg font-bold font-mono py-2.5 h-auto text-amber-900 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
            />

            <div className="grid grid-cols-5 gap-2">
              <Button variant="custom" size="none" onClick={() => handleManualCashInput(grandTotal)}
                className="py-1.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors cursor-pointer text-center"
              >
                Exact
              </Button>
              {quickCashIncrements.map((amt) => (
                <Button variant="custom" size="none" key={amt}
                  onClick={() => handleQuickCash(amt)}
                  className="py-1.5 text-xs font-bold bg-white text-amber-700 rounded-lg border border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer text-center font-mono"
                >
                  +{amt}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Complete Sale Action button */}
      <Button variant="custom" size="none" onClick={handleCompleteTransaction}
        disabled={isCartEmpty || (paymentMethod === 'CASH' && cashReceived < grandTotal) || isSubmitting}
        className={`
          w-full py-3.5 mt-2 rounded-xl font-poppins font-bold text-sm tracking-wide shadow-sm transition-all text-center flex items-center justify-center gap-2 select-none cursor-pointer active:scale-[0.98]
          ${isCartEmpty
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            : paymentMethod === 'CASH' && cashReceived < grandTotal
              ? 'bg-amber-100 text-amber-700/60 cursor-not-allowed shadow-none border border-amber-200'
              : 'bg-accent-primary hover:bg-accent-dark text-white'
          }
          ${isSubmitting ? 'opacity-80 cursor-wait' : ''}
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin text-white/80" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Complete Sale & Print Receipt</span>
        )}
      </Button>

    </div>
  );
}
