import { useState, useEffect } from 'react';
import { Printer, RefreshCw, Wifi, MonitorSmartphone, Link2, Unlink, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePrinterService } from '@/hooks/usePrinterService';
import { PrinterServiceModal } from './PrinterServiceModal';
import { useBranchStore } from '@/store/branchStore';

interface HardwareTabProps {
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function HardwareTab({ addToast }: HardwareTabProps) {
  const {
    isConnected, isChecking, checkConnection,
    printers, isScanning, scanPrinters,
    testPrint, deviceStatus, pairDevice, unpairDevice,
  } = usePrinterService();

  const branches = useBranchStore(state => state.branches);

  const [printingTo, setPrintingTo] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [isUnpairing, setIsUnpairing] = useState(false);

  // Ensure branches are loaded when the tab is accessed (e.g., on direct navigation/reload)
  useEffect(() => {
    if (branches.length === 0) {
      useBranchStore.getState().loadTenantBranches();
    }
  }, [branches.length]);

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

  const handlePairPrinter = async () => {
    if (!pairingCode || pairingCode.length !== 4) {
      addToast('Please enter a valid 4-digit pairing code', 'warning');
      return;
    }
    if (!selectedBranchId) {
      addToast('Please select a branch for this printer', 'warning');
      return;
    }

    setIsPairing(true);
    const result = await pairDevice(pairingCode, selectedBranchId);
    if (result.success) {
      addToast(result.message, 'success');
      setPairingCode('');
      setSelectedBranchId('');
    } else {
      addToast(result.message, 'error');
    }
    setIsPairing(false);
  };

  const handleUnpairPrinter = async () => {
    setIsUnpairing(true);
    const success = await unpairDevice();
    if (success) {
      addToast('Printer unpaired successfully', 'success');
    } else {
      addToast('Failed to unpair printer', 'error');
    }
    setIsUnpairing(false);
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
            {deviceStatus && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Cloud Status:</span>
                  <span className={`font-semibold flex items-center gap-1 ${deviceStatus.isPaired ? 'text-green-600' : 'text-amber-600'}`}>
                    {deviceStatus.isPaired ? <Cloud size={12} /> : <CloudOff size={12} />}
                    {deviceStatus.isPaired ? 'Paired' : 'Not Paired'}
                  </span>
                </div>
                {deviceStatus.isPaired && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Device ID:</span>
                    <span className="font-mono text-[10px] text-text-secondary">{deviceStatus.deviceId?.substring(0, 12)}...</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle/10 flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1 text-xs font-bold" onClick={checkConnection}>
              Refresh Connection
            </Button>
            {deviceStatus?.isPaired && (
              <Button
                variant="custom"
                size="none"
                className="px-3 py-1.5 text-[10px] font-bold rounded-md text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                onClick={handleUnpairPrinter}
                loading={isUnpairing}
              >
                <Unlink size={12} className="mr-1" />
                Unpair
              </Button>
            )}
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

      {/* Cloud Printer Pairing Section */}
      {!deviceStatus?.isPaired && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/50 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Link2 size={16} className="text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-text-primary">Pair Printer to Cloud</h4>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Enter the 4-digit code shown on the printer service console to link it to a branch.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Pairing Code Input */}
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Pairing Code
              </label>
              <input
                type="text"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 4921"
                maxLength={4}
                className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm font-mono font-bold text-center tracking-[8px] placeholder:tracking-normal placeholder:font-normal placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Branch Selector */}
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Assign to Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all cursor-pointer"
              >
                <option value="">Select a branch...</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pair Button */}
            <Button
              variant="custom"
              size="none"
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-50"
              onClick={handlePairPrinter}
              loading={isPairing}
              disabled={!pairingCode || pairingCode.length !== 4 || !selectedBranchId}
            >
              <Link2 size={14} className="mr-1.5" />
              Pair Printer
            </Button>
          </div>

          {/* Helper Info */}
          <div className="mt-4 pt-3 border-t border-indigo-200/50">
            <p className="text-[10px] text-indigo-600/70 leading-relaxed">
              💡 <strong>How to pair:</strong> Run the <code className="bg-indigo-100 px-1 rounded text-indigo-700">ks-printer-service.exe</code> on 
              the target machine. It will display a 4-digit code in its console window. Enter that code above and select which branch 
              this printer belongs to.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
