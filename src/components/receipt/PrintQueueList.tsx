import { useState } from 'react';
import {
  Printer,
  RefreshCw,
  Trash2,
  ExternalLink,
  Search,
  FileText,
  Sliders,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/Input';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { PrintStatusBadge } from '@/components/receipt/PrintStatusBadge';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { useBranchStore } from '@/store/branchStore';
import { PrinterStatus, ReceiptType } from '@/types/print';

export function PrintQueueList() {
  const {
    jobs,
    printers,
    retryJob,
    cancelJob,
    forceCompleteJob,
    clearAllJobs,
    updatePrinter,
    resetPrinters
  } = usePrintQueue();

  const { addToast } = useUIStore();;
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'printers'>('queue');

  const { branches } = useBranchStore();

  const filteredJobs = jobs.filter(job => {
    const term = search.toLowerCase();
    return (
      job.orderNumber.toLowerCase().includes(term) ||
      job.id.toLowerCase().includes(term) ||
      job.branchName.toLowerCase().includes(term) ||
      job.printerName.toLowerCase().includes(term)
    );
  });

  const getReceiptTypeLabel = (type: ReceiptType) => {
    switch (type) {
      case 'customer_receipt': return 'Customer Receipt';
      case 'kitchen_docket': return 'Kitchen Docket';
      case 'invoice': return 'A4 Tax Invoice';
      default: return 'Receipt';
    }
  };

  const handleTogglePrinterStatus = (branchId: string, printerId: string, currentStatus: PrinterStatus) => {
    let nextStatus: PrinterStatus = 'online';
    if (currentStatus === 'online') nextStatus = 'offline';
    else if (currentStatus === 'offline') nextStatus = 'error';

    updatePrinter(branchId, printerId, { status: nextStatus });
    addToast(`Printer status updated to ${nextStatus.toUpperCase()}`, 'info');
  };

  return (
    <div className="bg-white rounded-3xl border border-border-subtle p-5 shadow-sm flex flex-col gap-5 select-none h-full min-h-[480px]">

      {/* Tab Header & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Printer size={18} />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-sm text-text-primary">Cloud Print Console</h3>
            <p className="text-[10px] text-text-secondary">Simulated Local Branch Spoolers</p>
          </div>
        </div>

        {/* Tab Toggle buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <Button
            size="sm"
            variant={activeTab === 'queue' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 text-[11px] h-auto ${activeTab === 'queue' ? 'bg-white text-accent-dark shadow-xs hover:text-accent-dark hover:bg-accent-tint-bg' : 'text-slate-500'}`}
          >
            Active Jobs ({jobs.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'printers' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('printers')}
            className={`px-3 py-1.5 text-[11px] h-auto ${activeTab === 'printers' ? 'bg-white text-accent-dark shadow-xs hover:text-accent-dark hover:bg-accent-tint-bg' : 'text-slate-500'}`}
          >
            Branch Printers
          </Button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="flex-1 flex flex-col gap-4">
          {/* Search bar and clear queue control */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search jobs, orders, branches..."
                leftIcon={<Search size={14} className="text-slate-400" />}
              />
            </div>

            {jobs.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                icon={<Trash2 size={12} />}
                onClick={clearAllJobs}
                className="px-3 py-2 text-[10px] uppercase h-auto"
              >
                Clear History
              </Button>
            )}
          </div>

          {/* Jobs Spool table */}
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredJobs.length === 0 ? (
              <div className="py-14 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
                <FileText size={28} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">No Print Jobs in Queue</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  Submit an order from the POS or choose Print Receipt in Order details to dispatch jobs here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {filteredJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col gap-2.5 transition-all ${job.status === 'failed'
                        ? 'border-rose-150 bg-rose-50/20'
                        : job.status === 'printed'
                          ? 'border-emerald-150 bg-emerald-50/10'
                          : 'border-border-subtle bg-slate-50/50'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Title details */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">{job.orderNumber}</span>
                            <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {getReceiptTypeLabel(job.receiptType)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Branch: <span className="font-bold text-slate-700">{job.branchName}</span> • Printer: <span className="font-bold text-slate-700">{job.printerName}</span>
                          </p>
                        </div>
                        {/* Status Badge */}
                        <PrintStatusBadge status={job.status} size="sm" />
                      </div>

                      {/* Diagnostic details if failed */}
                      {job.status === 'failed' && (
                        <div className="p-2 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-1.5 text-rose-800 text-[10px] font-medium leading-normal">
                          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                          <span>{job.errorMessage || 'Unknown spooler error occurred.'}</span>
                        </div>
                      )}

                      {/* Timestamps & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100/50 pt-2.5 mt-0.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <div>
                          <span>Sent: {new Date(job.createdTime).toLocaleTimeString()}</span>
                          {job.printedTime && (
                            <span className="ml-3 text-emerald-600">Printed: {new Date(job.printedTime).toLocaleTimeString()}</span>
                          )}
                        </div>

                        {/* Interactive operations */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {job.documentUrl && (
                            <a
                              href={job.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Download or view generated PDF copy"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-extrabold bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all"
                            >
                              <ExternalLink size={10} />
                              <span>View PDF</span>
                            </a>
                          )}

                          {(job.status === 'pending' || job.status === 'printing') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelJob(job.id)}
                              className="px-2.5 py-1 h-auto text-[10px]"
                            >
                              Cancel
                            </Button>
                          )}

                          {job.status === 'failed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => forceCompleteJob(job.id)}
                                className="px-2.5 py-1 h-auto text-[10px]"
                              >
                                Force Success
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<RefreshCw size={9} className="animate-spin-once" />}
                                onClick={() => retryJob(job.id)}
                                className="px-2.5 py-1 h-auto text-[10px]"
                              >
                                Retry Print
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* Printer configuration supervisor panel */}
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col gap-1.5 text-left">
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold">
              <Sliders size={14} />
              <span>Simulated Printer Control Panel</span>
            </div>
            <p className="text-[10px] text-amber-700 leading-normal">
              Click any printer card to cycle its state between **Online**, **Offline** (to simulate network failures), and **Error** (to simulate paper jams). This demonstrates how the cloud spooler reacts instantly!
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] pr-1.5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
            {branches.map(branch => {
              const branchPrinters = printers[branch.id] || [];
              return (
                <div key={branch.id} className="space-y-2 text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <h4 className="text-xs font-bold text-slate-800">{branch.name}</h4>
                    <span className="text-[8px] font-extrabold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {branch.area}, {branch.city}
                    </span>
                  </div>

                  {branchPrinters.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No printers configured for this branch.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {branchPrinters.map(printer => (
                        <div
                          key={printer.id}
                          onClick={() => handleTogglePrinterStatus(branch.id, printer.id, printer.status)}
                          className={`p-3 rounded-2xl border cursor-pointer hover:shadow-xs transition-all flex items-start gap-2.5 ${printer.status === 'online'
                            ? 'bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40'
                            : printer.status === 'offline'
                              ? 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                              : 'bg-rose-50/20 border-rose-150 hover:bg-rose-50/40'
                            }`}
                        >
                          <div className={`p-1.5 rounded-xl ${printer.status === 'online'
                            ? 'bg-emerald-100/50 text-emerald-700'
                            : printer.status === 'offline'
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-rose-100 text-rose-700'
                            }`}>
                            <Printer size={14} />
                          </div>

                          <div className="flex-1 space-y-0.5 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[10px] font-bold text-slate-900 truncate block leading-tight">{printer.name}</span>
                              {printer.isDefault && (
                                <span className="text-[7px] font-extrabold uppercase bg-indigo-50 text-indigo-600 px-1 rounded shrink-0">Def</span>
                              )}
                            </div>

                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                              Type: {printer.type} • Spool: {printer.connectionString}
                            </p>

                            <div className="flex items-center gap-1 pt-1">
                              {printer.status === 'online' ? (
                                <>
                                  <Wifi size={10} className="text-emerald-600" />
                                  <span className="text-[8px] font-extrabold uppercase text-emerald-700">Online</span>
                                </>
                              ) : printer.status === 'offline' ? (
                                <>
                                  <WifiOff size={10} className="text-slate-500" />
                                  <span className="text-[8px] font-extrabold uppercase text-slate-600">Offline</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle size={10} className="text-rose-600" />
                                  <span className="text-[8px] font-extrabold uppercase text-rose-700">Error (Paper Jam)</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetPrinters();
              addToast('Printers reset to system factory defaults.', 'success');
            }}
            className="w-full border-dashed"
          >
            Reset Printer Configs
          </Button>
        </div>
      )}
    </div>
  );
}
