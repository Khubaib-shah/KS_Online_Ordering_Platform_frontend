import { Printer, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PrinterServiceModalProps {
  onRetry: () => void;
  isChecking: boolean;
}

export function PrinterServiceModal({ onRetry, isChecking }: PrinterServiceModalProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-border-subtle/30 rounded-2xl shadow-sm max-w-lg mx-auto mt-10 text-center animate-fade-in">
      <div className="w-16 h-16 bg-accent-tint-bg rounded-full flex items-center justify-center mb-5 border border-accent-primary/20">
        <Printer size={32} className="text-accent-primary" />
      </div>

      <h3 className="font-sans font-bold text-xl text-text-primary mb-2">
        Local POS Service Required
      </h3>

      <p className="text-sm text-text-secondary mb-6 leading-relaxed">
        To securely connect and print to your local thermal printers and cash drawers, you need to run the Indolj Local Hardware Service on this computer.
      </p>

      <div className="flex flex-col gap-3 w-full sm:w-auto">
        <Button
          variant="primary"
          icon={<Download size={16} />}
          onClick={() => window.open(import.meta.env.VITE_HARDWARE_SERVICE_URL || '/downloads/hardware-service', '_blank')}
        >
          Download Local Service
        </Button>

        <Button
          variant="secondary"
          icon={<RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />}
          onClick={onRetry}
          loading={isChecking}
        >
          {isChecking ? 'Checking connection...' : 'I have it running, connect now'}
        </Button>
      </div>

      <div className="mt-8 text-left w-full bg-white p-4 rounded-xl border border-border-subtle/20 text-xs text-text-secondary">
        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-1">
          <CheckCircle size={14} className="text-green-500" />
          How to install
        </h4>
        <ol className="list-decimal pl-4 space-y-1.5">
          <li>Download the installer using the button above.</li>
          <li>Run the installer and follow the instructions.</li>
          <li>Once running, click "Connect now" to sync your hardware.</li>
        </ol>
      </div>
    </div>
  );
}
