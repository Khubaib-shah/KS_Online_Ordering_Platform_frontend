import { useState, useEffect } from 'react';
import { Printer, Settings, RefreshCw, CheckCircle, Wifi, MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePrinterService } from '@/hooks/usePrinterService';
import { PrinterServiceModal } from './PrinterServiceModal';

interface HardwareTabProps {
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function HardwareTab({ addToast }: HardwareTabProps) {
  const { isConnected, isChecking, checkConnection, printers, isScanning, scanPrinters, testPrint } = usePrinterService();
  const [printingTo, setPrintingTo] = useState<string | null>(null);

  const handleTestPrint = async (printerName: string) => {
    setPrintingTo(printerName);
    const success = await testPrint(printerName);
    if (success) {
      addToast(`Test page sent to ${printerName}`, 'success');
    } else {
      addToast(`Failed to print to ${printerName}`, 'error');
    }
    setPrintingTo(null);
  };

  // If the local service is not running or unreachable, show the modal
  if (!isConnected) {
    return (
      <div className="animate-fade-in py-4">
        <PrinterServiceModal onRetry={checkConnection} isChecking={isChecking} />
      </div>
    );
  }

  // Active Connection Dashboard
  return (
    <div className="flex flex-col gap-6.5 animate-fade-in" id="form-hardware">
      <div className="border-b border-border-subtle/10 pb-3 flex justify-between items-end">
        <div>
          <h3 className="font-sans font-extrabold text-base text-text-primary">
            Hardware & POS
          </h3>
          <p className="text-xs text-text-secondary mt-1">Manage connected printers, cash drawers, and devices.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-bold text-green-700">Local Service Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device Status Card */}
        <div className="bg-slate-50 border border-border-subtle/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MonitorSmartphone size={20} className="text-accent-primary" />
            <h4 className="font-bold text-sm text-text-primary">This Device</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Connection:</span>
              <span className="font-semibold text-green-600 flex items-center gap-1">
                <Wifi size={12} /> Connected
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Printers Found:</span>
              <span className="font-semibold text-text-primary">{printers.length}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle/10">
            <Button variant="secondary" size="sm" className="w-full text-xs font-bold" onClick={checkConnection}>
              Refresh Connection
            </Button>
          </div>
        </div>

        {/* Printer Setup Area */}
        <div className="bg-slate-50 border border-border-subtle/30 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-subtle/10">
            <div className="flex items-center gap-2">
              <Printer size={16} className="text-accent-primary" />
              <h4 className="font-bold text-sm text-text-primary">Local Printers</h4>
            </div>
            <Button 
              variant="primary" 
              size="none" 
              className="text-[11px] font-bold px-3 py-1.5 h-auto rounded-md"
              onClick={scanPrinters}
              loading={isScanning}
              icon={<RefreshCw size={12} className={isScanning ? "animate-spin" : ""} />}
            >
              Scan
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-48 pr-1 space-y-2 no-scrollbar">
            {printers.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-6">
                <p className="text-xs text-text-secondary mb-1">
                  No printers detected.
                </p>
                <p className="text-[10px] text-text-secondary/70">
                  Click 'Scan' to fetch Windows printers.
                </p>
              </div>
            ) : (
              printers.map((p, idx) => (
                <div key={idx} className="flex flex-col p-3 bg-white border border-border-subtle/30 rounded-lg text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-text-primary mr-2">{p.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${p.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.status}
                      </span>
                      <div className="text-[10px] text-text-secondary mt-1">{p.description}</div>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="none" 
                      className="px-2 py-1 text-[10px] font-bold rounded"
                      loading={printingTo === p.name}
                      onClick={() => handleTestPrint(p.name)}
                    >
                      Test Print
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
