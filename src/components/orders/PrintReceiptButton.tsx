import { Select } from '../ui/Select'; import { Button } from '@/components/ui/Button';

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Printer, X, Copy, Check, Sparkles, Receipt, Share2 } from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import { useUIStore } from '../../store/uiStore';
import { useReceipt } from '../../hooks/useReceipt';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../../types/order';

interface PrintReceiptButtonProps {
  orderNumber: string;
  order?: Order | null;
}

export function PrintReceiptButton({ orderNumber, order: propOrder }: PrintReceiptButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { activeTenant } = useTenantStore();
  const { addToast } = useUIStore();

  const { order, isLoading, loadOrderDetails } = useReceipt(orderNumber, propOrder);



  const handleOpenReceipt = () => {
    loadOrderDetails();
    setIsOpen(true);
  };

  const handleSystemPrint = async () => {
    if (!order) return;

    let targetPrinterName = localStorage.getItem('pos_target_printer');
    let printSuccess = false;

    try {
      if (!targetPrinterName) {
        const healthRes = await fetch('http://localhost:8082/health');
        if (healthRes.ok) {
          const printRes = await fetch('http://localhost:8082/printers');
          const data = await printRes.json();
          const printers = data.printers || [];
          if (printers.length > 0) {
            const onlineBlackCopper = printers.find((p: any) => p.name.toLowerCase().includes('blackcopper') && p.status === 'online');
            const anyBlackCopper = printers.find((p: any) => p.name.toLowerCase().includes('blackcopper'));
            const safeDefault = printers.find((p: any) => p.isDefault && !p.name.toLowerCase().includes('pdf') && !p.name.toLowerCase().includes('onenote'));

            const selectedPrinter = onlineBlackCopper || anyBlackCopper || safeDefault || printers[0];
            targetPrinterName = selectedPrinter.name;

            if (targetPrinterName) {
              localStorage.setItem('pos_target_printer', targetPrinterName);
            }
          }
        }
      }

      if (targetPrinterName) {
        const separator = '------------------------------------------';
        const currency = activeTenant?.currency || 'Rs.';

        let text = '';
        text += `${activeTenant?.name || 'Restaurant'}\n`;
        if (activeTenant?.tagline) text += `${activeTenant.tagline}\n`;
        if (activeTenant?.address) text += `${activeTenant.address}\n`;
        if (activeTenant?.phone) text += `Tel: ${activeTenant.phone}\n`;
        text += `${separator}\n`;
        text += `RECEIPT: ${order.orderNumber}\n`;
        text += `DATE   : ${new Date(order.placedAt).toLocaleString()}\n`;
        text += `CUST   : ${order.customer.name}\n`;
        if (order.customer.phone) text += `PHONE  : ${order.customer.phone}\n`;
        text += `TYPE   : ${order.delivery.type}\n`;
        if (order.delivery.type === 'DELIVERY' && order.delivery.address) {
          text += `ADDRESS: ${order.delivery.address}\n`;
        }
        text += `${separator}\n`;

        order.items.forEach(item => {
          text += `${item.qty}x ${item.name.padEnd(25).substring(0, 25)} ${currency} ${(item.total).toLocaleString()}\n`;
        });

        text += `${separator}\n`;
        text += `SUBTOTAL     : ${currency} ${order.subtotal.toLocaleString()}\n`;
        if (order.discount > 0) text += `DISCOUNT     : -${currency} ${order.discount.toLocaleString()} (${order.promoCode || 'PROMO'})\n`;
        text += `TAX          : ${currency} ${order.tax.toLocaleString()}\n`;
        if (order.deliveryFee > 0) text += `DELIVERY FEE : ${currency} ${order.deliveryFee.toLocaleString()}\n`;
        text += `GRAND TOTAL  : ${currency} ${order.grandTotal.toLocaleString()}\n`;
        text += `${separator}\n`;
        text += `PAYMENT      : ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})\n`;
        text += `${separator}\n`;
        text += `Thank you for choosing ${activeTenant?.name || 'Indolj'}!\n`;
        text += `TIP IS NOT INCLUDED.\n`;
        text += `PLEASE COME AGAIN!\n`;
        text += `${(activeTenant?.footerText || 'THANK YOU FOR DINING WITH US!').toUpperCase()}\n\n\n\n\n\n\n`;

        const postRes = await fetch('http://localhost:8082/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ printerName: targetPrinterName, content: text })
        });

        if (postRes.ok) {
          addToast(`Printed successfully to ${targetPrinterName}`, 'success');
          printSuccess = true;
          return;
        } else {
          localStorage.removeItem('pos_target_printer');
        }
      }
    } catch (err) {
      console.log('Local hardware service not detected or failed.', err);
      localStorage.removeItem('pos_target_printer');
    }

    if (!printSuccess) {
      alert('Failed to print to local printer. Please ensure ks-printer-service.exe is running and "Black Copper" printer is connected.');
    }
  };

  const handleCopyTextReceipt = () => {
    if (!order) return;
    const separator = '------------------------------------------';
    const currency = activeTenant?.currency || 'Rs.';

    let text = '';
    text += `${activeTenant?.name || 'Indolj Restaurant'}\n`;
    if (activeTenant?.tagline) text += `${activeTenant.tagline}\n`;
    if (activeTenant?.address) text += `${activeTenant.address}\n`;
    if (activeTenant?.phone) text += `Tel: ${activeTenant.phone}\n`;
    text += `${separator}\n`;
    text += `RECEIPT: ${order.orderNumber}\n`;
    text += `DATE   : ${new Date(order.placedAt).toLocaleString()}\n`;
    text += `CUST   : ${order.customer.name}\n`;
    text += `PHONE  : ${order.customer.phone}\n`;
    text += `TYPE   : ${order.delivery.type}\n`;
    if (order.delivery.type === 'DELIVERY' && order.delivery.address) {
      text += `ADDRESS: ${order.delivery.address}\n`;
    }
    text += `${separator}\n`;

    order.items.forEach(item => {
      text += `${item.qty}x ${item.name.padEnd(25).substring(0, 25)} ${currency} ${(item.total).toLocaleString()}\n`;
    });

    text += `${separator}\n`;
    text += `SUBTOTAL     : ${currency} ${order.subtotal.toLocaleString()}\n`;
    if (order.discount > 0) text += `DISCOUNT     : -${currency} ${order.discount.toLocaleString()} (${order.promoCode || 'PROMO'})\n`;
    text += `TAX          : ${currency} ${order.tax.toLocaleString()}\n`;
    if (order.deliveryFee > 0) text += `DELIVERY FEE : ${currency} ${order.deliveryFee.toLocaleString()}\n`;
    text += `GRAND TOTAL  : ${currency} ${order.grandTotal.toLocaleString()}\n`;
    text += `${separator}\n`;
    text += `PAYMENT      : ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})\n`;
    text += `${separator}\n`;
    text += `Thank you for choosing ${activeTenant?.name || 'Indolj'}!\n`;
    text += `Powered by Indolj Engine Core\n`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    addToast('Formatted text receipt copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(null as any), 2500);
  };

  return (
    <>
      <Button variant="custom" size="none" onClick={(e) => {
        e.stopPropagation();
        handleOpenReceipt();
      }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-text-primary bg-white hover:bg-slate-50 border border-border-subtle rounded-xl hover:border-slate-300 transition-all shadow-sm active:scale-95 cursor-pointer select-none no-row-click focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
      >
        <Printer size={13} className="text-slate-500 group-hover:text-text-primary" />
        <span>Print Receipt</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto no-scrollbar print:p-0 print:absolute print:inset-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs print:hidden"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm max-h-[92vh] sm:max-h-[90vh] bg-slate-100 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 sm:gap-5 z-10 print:bg-white print:p-0 print:shadow-none print:w-[80mm] print:max-w-none print:static"
            >
              {/* Top Controls Bar */}
              <div className="flex items-center justify-between text-slate-700 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/50 shadow-sm print:hidden">
                <div className="flex items-center gap-1.5">
                  <Receipt size={15} className="text-indigo-600" />
                  <span className="text-xs font-bold font-sans">POS Printer Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="custom" size="none" onClick={handleCopyTextReceipt}
                    title="Copy text ticket to clipboard"
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-600 animate-bounce" /> : <Copy size={14} />}
                  </Button>
                  <Button variant="custom" size="none" onClick={handleSystemPrint}
                    title="Send to physical printer"
                    className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <Printer size={14} />
                  </Button>
                  <Button variant="custom" size="none" onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer ml-1"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>

              {/* Main Thermal Paper Roll Container */}
              <div
                id="thermal-receipt-print-area"
                className="bg-white text-slate-900 border border-slate-200 shadow-md relative overflow-y-auto overflow-x-hidden rounded-2xl flex flex-col pt-5 pb-6 px-5 font-mono text-xs leading-relaxed select-text select-none print:border-none print:shadow-none print:p-0 print:m-0 min-h-0 flex-1 print:overflow-visible print:max-h-none scrollbar-thin scrollbar-thumb-slate-300"
              >
                {/* Embedded dynamic print CSS inside the element during rendering */}
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #thermal-receipt-print-area, #thermal-receipt-print-area * {
                      visibility: visible !important;
                    }
                    #thermal-receipt-print-area {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 80mm !important;
                      padding: 10px !important;
                      margin: 0 !important;
                      border: none !important;
                      box-shadow: none !important;
                      background: white !important;
                    }
                    .print\\:hidden {
                      display: none !important;
                    }
                  }
                `}</style>

                {/* Sawtooth Top Edge Effect */}
                <div className="absolute top-0 left-0 right-0 flex overflow-hidden h-1.5 select-none pointer-events-none bg-transparent print:hidden">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 bg-slate-100 rotate-45 transform -translate-y-1.5 shrink-0 border border-slate-200"
                    />
                  ))}
                </div>

                {isLoading || !order ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Generating Docket...</p>
                  </div>
                ) : (
                  <>
                    {/* Brand Header */}
                    <div className="text-center space-y-1 mt-1">
                      <h2
                        className="text-sm font-extrabold tracking-tight uppercase"
                        style={{ color: activeTenant?.brandColor || '#0F172A' }}
                      >
                        {activeTenant?.name || 'Indolj Fine Dining'}
                      </h2>
                      {activeTenant?.tagline && (
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {activeTenant.tagline}
                        </p>
                      )}
                      <div className="text-[9px] text-slate-500 space-y-0.5 pt-1">
                        {activeTenant?.address && <p>{activeTenant.address}</p>}
                        {activeTenant?.phone && <p>Tel: {activeTenant.phone}</p>}
                      </div>
                    </div>

                    {/* Meta Section */}
                    <div className="mt-4 space-y-1 text-[10px]">
                      <div className="flex justify-between border-t border-dashed border-slate-300 pt-2">
                        <span className="font-bold">RECEIPT #:</span>
                        <span className="font-bold">{order.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DATE:</span>
                        <span>{new Date(order.placedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CUSTOMER:</span>
                        <span className="font-bold text-slate-800">{order.customer.name}</span>
                      </div>
                      {order.customer.phone && (
                        <div className="flex justify-between">
                          <span>PHONE:</span>
                          <span>{order.customer.phone}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>ORDER TYPE:</span>
                        <span className="font-bold uppercase bg-slate-100 px-1 rounded">
                          {order.delivery.type}
                        </span>
                      </div>
                      {order.delivery.address && (
                        <div className="border-t border-dashed border-slate-200 pt-1 mt-1 text-[9px] text-slate-500 leading-normal">
                          <span className="font-bold text-[10px] text-slate-700 block">DELIVERY ADDRESS:</span>
                          {order.delivery.address}
                        </div>
                      )}
                    </div>

                    {/* Order Items Table */}
                    <div className="mt-4">
                      <div className="border-t-2 border-dashed border-slate-400 py-1.5 flex justify-between font-bold text-[10px]">
                        <span>ITEM DESCRIPTION</span>
                        <span>TOTAL</span>
                      </div>

                      <div className="divide-y divide-dashed divide-slate-200">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 space-y-0.5">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">
                                {item.qty}x {item.name}
                              </span>
                              <span className="font-bold shrink-0">
                                {(activeTenant?.currency || 'Rs.')} {item.total.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-500 pl-4">
                              <span>Rate: {(activeTenant?.currency || 'Rs.')} {item.unitPrice.toLocaleString()}</span>
                            </div>
                            {item.variants && item.variants.length > 0 && (
                              <div className="text-[9px] text-slate-400 pl-4 space-y-0.5">
                                {item.variants.map((v, vIdx) => (
                                  <p key={vIdx}>• {v}</p>
                                ))}
                              </div>
                            )}
                            {item.specialNote && (
                              <div className="text-[9px] italic text-amber-600 pl-4 bg-amber-50/50 py-0.5 rounded">
                                Note: &quot;{item.specialNote}&quot;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checkout Totals */}
                    <div className="mt-2 pt-2 border-t-2 border-dashed border-slate-400 space-y-1.5 text-[10px]">
                      <div className="flex justify-between text-slate-600">
                        <span>SUBTOTAL</span>
                        <span>{(activeTenant?.currency || 'Rs.')} {order.subtotal.toLocaleString()}</span>
                      </div>

                      {order.discount > 0 && (
                        <div className="flex justify-between text-rose-600 font-bold">
                          <span>PROMO SAVINGS ({order.promoCode || 'PROMO'})</span>
                          <span>-{(activeTenant?.currency || 'Rs.')} {order.discount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-600">
                        <span>SALES TAX ({activeTenant?.taxRate || 15}%)</span>
                        <span>{(activeTenant?.currency || 'Rs.')} {order.tax.toLocaleString()}</span>
                      </div>

                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>DELIVERY FEE</span>
                          <span>{(activeTenant?.currency || 'Rs.')} {order.deliveryFee.toLocaleString()}</span>
                        </div>
                      )}

                      {/* GRAND TOTAL */}
                      <div className="flex justify-between text-xs font-bold border-t border-double border-slate-900 pt-2.5 mt-1">
                        <span className="uppercase tracking-wide text-slate-950">GRAND TOTAL</span>
                        <span className="text-slate-950 underline underline-offset-2 decoration-double">
                          {(activeTenant?.currency || 'Rs.')} {order.grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Payment Status Check */}
                    <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Payment Details</p>
                      <p className="text-[11px] font-extrabold text-slate-900 uppercase">
                        {order.paymentMethod === 'COD' || order.paymentMethod === 'CASH' ? 'Cash on Delivery' : order.paymentMethod}
                      </p>
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.2 rounded-full border ${order.paymentStatus.toLowerCase() === 'paid'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                        {order.paymentStatus}
                      </span>
                    </div>

                    {/* Barcode representation */}
                    <div className="mt-5 flex flex-col items-center gap-1">
                      <div className="flex items-center h-8 gap-[1px] bg-white p-1 select-none pointer-events-none">
                        <div className="w-[1.5px] h-6 bg-black" />
                        <div className="w-[0.5px] h-6 bg-black" />
                        <div className="w-[2px] h-6 bg-black" />
                        <div className="w-[1px] h-6 bg-black" />
                        <div className="w-[0.5px] h-6 bg-black" />
                        <div className="w-[1.5px] h-6 bg-black" />
                        <div className="w-[3px] h-6 bg-black" />
                        <div className="w-[0.5px] h-6 bg-black" />
                        <div className="w-[1px] h-6 bg-black" />
                        <div className="w-[2px] h-6 bg-black" />
                        <div className="w-[1.5px] h-6 bg-black" />
                        <div className="w-[0.5px] h-6 bg-black" />
                        <div className="w-[1px] h-6 bg-black" />
                        <div className="w-[2.5px] h-6 bg-black" />
                        <div className="w-[0.5px] h-6 bg-black" />
                        <div className="w-[1.5px] h-6 bg-black" />
                        <div className="w-[2px] h-6 bg-black" />
                        <div className="w-[1px] h-6 bg-black" />
                        <div className="w-[0.5px] h-6 bg-black" />
                        <div className="w-[3px] h-6 bg-black" />
                        <div className="w-[1px] h-6 bg-black" />
                        <div className="w-[1.5px] h-6 bg-black" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">
                        * {order.orderNumber.split('-').pop()} *
                      </span>
                    </div>

                    {/* Nice Footer Greetings */}
                    <div className="mt-5 text-center space-y-1 border-t border-dashed border-slate-300 pt-3">
                      <p className="text-[10px] font-bold text-slate-800 italic">
                        Thank you for choosing {activeTenant?.name || 'Indolj'}!
                      </p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest">
                        Indolj POS Platform • live core
                      </p>
                    </div>
                  </>
                )}

                {/* Sawtooth Bottom Edge Effect */}
                <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden h-1.5 select-none pointer-events-none bg-transparent print:hidden">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 bg-slate-100 rotate-45 transform translate-y-1.5 shrink-0 border border-slate-200"
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons Footer inside popup */}
              <div className="flex gap-2.5 print:hidden">
                <Button variant="custom" size="none" onClick={handleCopyTextReceipt}
                  className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <Share2 size={14} />
                  <span>Copy Ticket</span>
                </Button>
                <Button variant="custom" size="none" onClick={handleSystemPrint}
                  className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
