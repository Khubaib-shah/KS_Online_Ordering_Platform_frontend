import { useState, useRef } from 'react';
import { X, Printer, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTenantStore } from '@/store/tenantStore';
import { useBranchStore } from '@/store/branchStore';
import { Order } from '@/types/order';
import { PLATFORM_NAME } from '@/config/platform';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: (cancelSale?: boolean) => void;
  order: Order | null;
  cashReceived?: number;
  changeAmount?: number;
}

export function ReceiptModal({ isOpen, onClose, order, cashReceived = 0, changeAmount = 0 }: ReceiptModalProps) {
  const [receiptSize, setReceiptSize] = useState<'80mm' | '58mm'>('80mm');
  const [isPrinting, setIsPrinting] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { activeTenant } = useTenantStore();
  const branches = useBranchStore(state => state.branches);

  if (!isOpen || !order) return null;

  const branch = branches.find(b => b.id === order.branchId);
  const printName = branch?.name || activeTenant?.name || 'RESTAURANT NAME';
  const printAddress = activeTenant?.address || branch?.address || '';
  const printPhone = activeTenant?.phone || branch?.phone || '';

  const formatReceiptDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    let printSuccess = false;

    try {
      let targetPrinterName = localStorage.getItem('pos_target_printer');

      if (!targetPrinterName) {
        const healthRes = await fetch('http://localhost:8082/health');
        if (healthRes.ok) {
          const printRes = await fetch('http://localhost:8082/printers');
          const data = await printRes.json();
          const printers = data.printers || [];
          if (printers.length > 0) {
            // Prioritize "Black Copper" that is online, then any "Black Copper"
            const onlineBlackCopper = printers.find((p: any) => p.name.toLowerCase().includes('black copper') && p.status === 'online');
            const anyBlackCopper = printers.find((p: any) => p.name.toLowerCase().includes('black copper'));

            // If no black copper, try to find an online default printer that isn't a PDF printer
            const safeDefault = printers.find((p: any) => p.isDefault && !p.name.toLowerCase().includes('pdf') && !p.name.toLowerCase().includes('onenote'));

            const selectedPrinter = onlineBlackCopper || anyBlackCopper || safeDefault || printers[0];
            targetPrinterName = selectedPrinter.name;

            if (targetPrinterName) {
              localStorage.setItem('pos_target_printer', targetPrinterName);
            }
          }
        }
      }

      if (targetPrinterName && printAreaRef.current) {

        // Construct Text Receipt
        let textReceipt = '';
        // Use 40 width for 80mm to fill more space on the right, and 32 for 58mm
        const lineLength = receiptSize === '80mm' ? 40 : 32;
        const centerText = (text: string) => {
          if (text.length >= lineLength) return text;
          const pad = Math.floor((lineLength - text.length) / 2);
          return ' '.repeat(pad) + text;
        };
        const justifyRow = (left: string, right: string) => {
          const maxLeftLength = lineLength - right.length - 1;
          if (left.length > maxLeftLength) {
            const truncatedLeft = left.substring(0, maxLeftLength - 2) + '..';
            return truncatedLeft + ' ' + right;
          }
          const spaces = lineLength - left.length - right.length;
          return left + ' '.repeat(spaces) + right;
        };
        const hr = '-'.repeat(lineLength) + '\n';

        textReceipt += '\n';
        const restaurantName = activeTenant?.name || 'RESTAURANT NAME';
        textReceipt += centerText(restaurantName.toUpperCase()) + '\n';
        if (printName && printName.toLowerCase() !== restaurantName.toLowerCase()) {
          textReceipt += centerText(printName.toUpperCase()) + '\n';
        }
        if (printAddress) {
          const addressStr = printAddress.toUpperCase().trim();
          for (let i = 0; i < addressStr.length; i += lineLength) {
            textReceipt += centerText(addressStr.substring(i, i + lineLength).trim()) + '\n';
          }
        }
        if (printPhone) {
          textReceipt += centerText(`PHONE: ${printPhone}`) + '\n';
        }
        if (activeTenant?.slug) {
          textReceipt += centerText(`WWW.${activeTenant.slug.toUpperCase()}.COM`) + '\n';
        }
        textReceipt += hr;
        textReceipt += centerText(formatReceiptDate(order.placedAt)) + '\n';
        textReceipt += hr;

        order.items.forEach(item => {
          textReceipt += justifyRow(`${item.qty}X ${item.name}`, `Rs. ${item.total.toLocaleString()}`) + '\n';
          if (item.variants && item.variants.length > 0) {
            textReceipt += `  + ${item.variants.join(', ')}\n`;
          }
        });

        textReceipt += hr;
        textReceipt += justifyRow('SUBTOTAL:', `Rs. ${order.subtotal.toLocaleString()}`) + '\n';
        if (order.tax > 0) textReceipt += justifyRow('TAX:', `Rs. ${order.tax.toLocaleString()}`) + '\n';
        if (order.discount > 0) textReceipt += justifyRow('DISCOUNT:', `-Rs. ${order.discount.toLocaleString()}`) + '\n';
        textReceipt += justifyRow('TOTAL:', `Rs. ${order.grandTotal.toLocaleString()}`) + '\n';
        textReceipt += hr;

        if (order.paymentMethod?.toLowerCase() === 'card') {
          textReceipt += justifyRow('CARD:', '•••• 9981') + '\n';
          textReceipt += justifyRow('TYPE:', 'MASTERCARD') + '\n';
          textReceipt += justifyRow('ENTRY:', 'CONTACTLESS') + '\n';
          textReceipt += justifyRow('TIME:', formatReceiptDate(order.placedAt)) + '\n';
        } else {
          textReceipt += justifyRow('CASH:', `Rs. ${order.grandTotal.toLocaleString()}`) + '\n';
          if (cashReceived > 0) {
            textReceipt += justifyRow('RECEIVED:', `Rs. ${cashReceived.toLocaleString()}`) + '\n';
            textReceipt += justifyRow('CHANGE:', `Rs. ${changeAmount.toLocaleString()}`) + '\n';
          }
        }
        textReceipt += justifyRow('STATUS:', 'APPROVED') + '\n';
        textReceipt += hr;
        textReceipt += centerText('TIP IS NOT INCLUDED.') + '\n';
        textReceipt += centerText('PLEASE COME AGAIN!') + '\n';
        textReceipt += centerText((activeTenant?.footerText || 'THANK YOU FOR DINING WITH US!').toUpperCase()) + '\n\n\n\n\n\n\n';

        // Send text to printer
        const postRes = await fetch('http://localhost:8082/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ printerName: targetPrinterName, content: textReceipt })
        });

        if (postRes.ok) {
          console.log(`Successfully printed to local printer: ${targetPrinterName}`);
          printSuccess = true;
          onClose(); // Close modal immediately upon successful local print
        } else {
          // If the cached printer failed to print, it might be disconnected or renamed
          localStorage.removeItem('pos_target_printer');
        }
      }
    } catch (err) {
      console.log('Local hardware service not detected or failed.', err);
      localStorage.removeItem('pos_target_printer');
    } finally {
      setIsPrinting(false);
    }

    if (!printSuccess) {
      alert('Failed to print to local printer. Please ensure the printer service is running and your "Black Copper" printer is connected.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 select-none animate-fade-in">
      <style>{`
        .receipt-paper {
          font-family: 'Courier New', Courier, monospace !important;
        }
        .receipt-paper .center { text-align: center; }
        .receipt-paper .right { text-align: right; }
        .receipt-paper .bold { font-weight: bold; }
        .receipt-paper .divider { 
          border-top: 1px dashed #000; 
          margin: 8px 0; 
          height: 0; 
          overflow: hidden; 
          color: transparent;
        }
        .receipt-paper .double-divider { 
          border-top: 3px double #000; 
          margin: 8px 0; 
          height: 0; 
          overflow: hidden; 
          color: transparent;
        }
        .receipt-paper .item-row { 
          display: flex !important; 
          justify-content: space-between !important; 
          margin-bottom: 4px; 
          gap: 8px;
        }
        .receipt-paper .item-variants { 
          font-size: 9px; 
          padding-left: 10px; 
          margin-top: -3px; 
          margin-bottom: 4px; 
        }
        .receipt-paper .totals-table { 
          width: 100%; 
          margin-top: 5px; 
        }
        .receipt-paper .totals-table td { 
          padding: 2px 0; 
        }
        .receipt-paper .barcode { 
          font-family: 'IDAutomationHC39M', 'Courier New', monospace; 
          font-size: 20px; 
          margin-top: 10px; 
        }
      `}</style>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-card border border-border-subtle flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header bar */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-muted">
          <div className="flex items-center gap-2 text-left">
            <div className="w-6 h-6 rounded-full bg-accent-tint-bg flex items-center justify-center text-accent-primary shrink-0">
              <CheckCircle2 size={14} />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-sm text-text-primary">Sale Completed</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Receipt is generated successfully</p>
            </div>
          </div>
          <Button variant="custom" size="none"
            onClick={() => onClose()}
            className="p-1.5 hover:bg-surface-hover rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Toggles for 58mm and 80mm widths */}
        <div className="p-3 bg-surface-muted/50 border-b border-border-subtle flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Thermal Printer Width
          </span>
          <div className="flex items-center gap-1 bg-white border border-border-subtle p-0.5 rounded-lg shadow-xs shrink-0 select-none">
            <Button variant="custom" size="none" onClick={() => setReceiptSize('80mm')}
              className={`
                px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer
                ${receiptSize === '80mm'
                  ? 'bg-accent-primary text-white shadow-xs'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }
              `}
            >
              80mm
            </Button>
            <Button variant="custom" size="none" onClick={() => setReceiptSize('58mm')}
              className={`
                px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer
                ${receiptSize === '58mm'
                  ? 'bg-accent-primary text-white shadow-xs'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }
              `}
            >
              58mm
            </Button>
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-stone-100 flex justify-center items-start">

          {/* Simulated Thermal Paper Container */}
          <div
            ref={printAreaRef}
            className={`
              receipt-paper bg-white p-5 shadow-sm border border-stone-200 text-left font-mono text-[11px] leading-relaxed text-black transition-all h-auto
              ${receiptSize === '80mm' ? 'w-[300px]' : 'w-[220px]'}
            `}
            style={{ minHeight: 'auto', height: 'auto' }}
          >
            {/* Elegant Fork and Knife Logo at Top Center */}
            <div className="flex justify-center mb-4">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                {/* Fork */}
                <path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v6M8 12v9" />
                {/* Knife */}
                <path d="M17 3v10a2 2 0 0 0 2 2V3h-2zM18 15v6" />
              </svg>
            </div>

            {/* Store Information Header */}
            <div className="text-center font-bold text-sm tracking-[2px] uppercase mb-1 font-mono text-black leading-tight whitespace-pre-line">
              {activeTenant?.name || 'RESTAURANT NAME'}
              {printName && printName.toLowerCase() !== (activeTenant?.name || '').toLowerCase() && (
                <>
                  <br />
                  {printName}
                </>
              )}
            </div>
            <div className="text-center text-[10px] uppercase tracking-wider text-black mb-4 font-mono leading-relaxed whitespace-pre-line">
              {printAddress ? printAddress.split(',').join('\n') : ''}
              {printPhone && (
                <>
                  <br />
                  PHONE: {printPhone}
                </>
              )}
              {activeTenant?.slug && (
                <>
                  <br />
                  WWW.{activeTenant.slug.toUpperCase()}.COM
                </>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '10px 0' }} />

            {/* Meta Info */}
            <div className="font-mono text-[10px] text-black leading-relaxed mb-3 uppercase">
              <div className="text-center">{formatReceiptDate(order.placedAt)}</div>
              <div className="flex justify-between mt-1">
                <span>RECEIPT: #{order.orderNumber}</span>
                <span>TABLE: 12</span>
              </div>
              <div className="flex justify-between">
                <span>SERVER: {PLATFORM_NAME}</span>
                <span>GUESTS: 2</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '10px 0' }} />

            {/* List of Ordered Items */}
            <div style={{ textTransform: 'uppercase', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0' }}>
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 'bold' }}>
                      {item.qty}X {item.name}
                    </span>
                    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      Rs. {item.total.toLocaleString()}
                    </span>
                  </div>
                  {item.variants && item.variants.length > 0 && (
                    <div style={{ fontSize: '9px', textTransform: 'lowercase', fontStyle: 'italic', paddingLeft: '12px', color: '#333', marginTop: '2px' }}>
                      + {item.variants.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '10px 0' }} />

            {/* Pricing calculations */}
            <div style={{ fontSize: '10px', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SUBTOTAL:</span>
                <span style={{ fontWeight: 'bold' }}>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TAX:</span>
                  <span style={{ fontWeight: 'bold' }}>Rs. {order.tax.toLocaleString()}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>DISCOUNT:</span>
                  <span style={{ fontWeight: 'bold' }}>-Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px', paddingTop: '6px', borderTop: '1px solid #000' }}>
                <span>TOTAL:</span>
                <span>Rs. {order.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '10px 0' }} />

            {/* Payment Section info */}
            <div style={{ fontSize: '10px', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', gap: '4px', margin: '10px 0' }}>
              {order.paymentMethod?.toLowerCase() === 'card' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CARD:</span>
                    <span>•••• 9981</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TYPE:</span>
                    <span>MASTERCARD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ENTRY:</span>
                    <span>CONTACTLESS</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TIME:</span>
                    <span>{formatReceiptDate(order.placedAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>REF:</span>
                    <span>REF: 892347612</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CASH:</span>
                    <span>Rs. {order.grandTotal.toLocaleString()}</span>
                  </div>
                  {cashReceived > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>TENDERED:</span>
                        <span>Rs. {cashReceived.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>CHANGE:</span>
                        <span>Rs. {changeAmount.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>STATUS:</span>
                <span>APPROVED</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '10px 0' }} />

            {/* Footer friendly labels */}
            <div style={{ textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', margin: '16px 0', lineHeight: '1.6' }}>
              <div>TIP IS NOT INCLUDED.</div>
              <div>PLEASE COME AGAIN!</div>
              <div style={{ fontWeight: 'bold', marginTop: '8px', fontSize: '11px' }}>THANK YOU FOR DINING WITH US!</div>
            </div>

            {/* Realistic CSS Barcode at Bottom (Removed as requested) */}
          </div>

        </div>

        {/* Footer with action buttons */}
        <div className="p-4 border-t border-border-subtle bg-surface-muted flex items-center justify-between gap-3">
          <Button variant="custom" size="none" onClick={() => onClose(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Cancel Sale
          </Button>
          <div className="flex gap-2">
            <Button variant="custom" size="none" onClick={() => onClose(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary bg-white border border-border-subtle hover:bg-surface-hover transition-colors cursor-pointer"
            >
              Done Without Print
            </Button>
            <Button variant="custom" size="none" onClick={handlePrint}
              disabled={isPrinting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent-primary hover:bg-accent-dark shadow-button transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              <span>{isPrinting ? 'Printing...' : 'Print Receipt'}</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
