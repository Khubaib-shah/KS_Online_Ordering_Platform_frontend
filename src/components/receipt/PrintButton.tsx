import { useState, useRef, useEffect } from 'react';import { Button } from '@/components/ui/Button';

import { Printer, ChevronDown, Loader2, Check, AlertCircle, FileText, UtensilsCrossed, Receipt } from 'lucide-react';
import { useBranchStore } from '@/store/branchStore';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useUIStore } from '@/store/uiStore';
import { ReceiptType } from '@/types/print';
import { SelectField } from '@/components/ui/forms/SelectField';

interface PrintButtonProps {
  orderNumber: string;
  defaultBranchId?: string;
  variant?: 'compact' | 'standard' | 'primary';
  className?: string;
}

export function PrintButton({
  orderNumber,
  defaultBranchId,
  variant = 'standard',
  className = ''
}: PrintButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpooling, setIsSpooling] = useState(false);
  const [lastJobStatus, setLastJobStatus] = useState<'idle' | 'spooled' | 'failed'>('idle');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { printReceipt } = usePrintQueue();
  const { addToast } = useUIStore();

  const { branches } = useBranchStore();
  const [selectedBranchId, setSelectedBranchId] = useState(defaultBranchId || branches[0]?.id || '');

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDispatchPrint = async (type: ReceiptType) => {
    setIsSpooling(true);
    setIsOpen(false);

    try {
      const branchToUse = selectedBranchId || branches[0]?.id || 'main';
      addToast(`Dispatching ${type.replace('_', ' ')} spool job...`, 'info');

      const job = await printReceipt(orderNumber, branchToUse, type);
      setLastJobStatus('spooled');

      // Auto-clear success status after a few seconds
      setTimeout(() => setLastJobStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setLastJobStatus('failed');
      addToast('Print spooling failed.', 'error');
    } finally {
      setIsSpooling(false);
    }
  };

  const currentSelectedBranchName = branches.find(b => b.id === selectedBranchId)?.name || 'Default Branch';

  const baseButtonClass = "inline-flex items-center gap-1.5 font-bold uppercase transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600";

  let buttonStyle = "h-9 px-3.5 text-[10px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-xs";
  if (variant === 'compact') {
    buttonStyle = "h-8 px-2.5 text-[9px] bg-white hover:bg-slate-50 border border-border-subtle text-slate-700 rounded-lg shadow-xs";
  } else if (variant === 'primary') {
    buttonStyle = "h-11 px-5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md";
  }

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div className="flex items-center">
        <Button variant="custom" size="none"           type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSpooling}
          className={`${baseButtonClass} ${buttonStyle} rounded-r-none border-r-0`}
        >
          {isSpooling ? (
            <Loader2 size={13} className="animate-spin text-slate-500" />
          ) : lastJobStatus === 'spooled' ? (
            <Check size={13} className="text-emerald-600" />
          ) : lastJobStatus === 'failed' ? (
            <AlertCircle size={13} className="text-rose-600" />
          ) : (
            <Printer size={13} className="text-slate-500" />
          )}

          <span>
            {isSpooling
              ? 'Spooling...'
              : lastJobStatus === 'spooled'
                ? 'Spooled!'
                : lastJobStatus === 'failed'
                  ? 'Failed'
                  : 'Print Cloud'}
          </span>
        </Button>

        {/* Dropdown Toggle Button Segment */}
        <Button variant="custom" size="none"           type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSpooling}
          className={`flex items-center justify-center h-9 sm:h-9 px-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl rounded-l-none cursor-pointer ${variant === 'compact' ? 'h-8' : variant === 'primary' ? 'h-11 text-indigo-600' : ''
            }`}
        >
          <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Spooler Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-[9999] overflow-hidden py-1.5 text-left">

          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50">
            <SelectField
              label="Dispatch Destination Branch"
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                addToast(`Target printer routed to ${branches.find(b => b.id === e.target.value)?.name}`, 'info');
              }}
              options={branches.map(b => ({ label: b.name, value: b.id }))}
              className="w-full text-[11px] font-bold text-slate-700 border border-slate-200 rounded-lg p-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="px-3.5 py-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Choose Print Ticket Type
            </span>
          </div>

          {/* Action List */}
          <div className="px-1.5 space-y-0.5">
            <Button variant="custom" size="none"               onClick={() => handleDispatchPrint('customer_receipt')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-all hover:translate-x-0.5 text-left"
            >
              <Receipt size={14} className="text-indigo-600" />
              <div>
                <span>Customer Thermal Copy</span>
                <p className="text-[9px] text-slate-400 font-medium font-sans">80mm Layout with brand details</p>
              </div>
            </Button>

            <Button variant="custom" size="none"               onClick={() => handleDispatchPrint('kitchen_docket')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-all hover:translate-x-0.5 text-left"
            >
              <UtensilsCrossed size={14} className="text-amber-600" />
              <div>
                <span>Kitchen Order Docket</span>
                <p className="text-[9px] text-slate-400 font-medium font-sans">Bold quantities & special notes</p>
              </div>
            </Button>

            <Button variant="custom" size="none"               onClick={() => handleDispatchPrint('invoice')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-all hover:translate-x-0.5 text-left"
            >
              <FileText size={14} className="text-emerald-600" />
              <div>
                <span>Full A4 Invoice PDF</span>
                <p className="text-[9px] text-slate-400 font-medium font-sans">Tabular grid, tax calculation</p>
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
