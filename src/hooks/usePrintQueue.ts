import { usePrintStore } from '@/store/printStore';
import { printService } from '@/services/print.service';
import { ReceiptType } from '@/types/print';

export function usePrintQueue() {
  const { jobs, printers, addPrinter, updatePrinter, removePrinter, clearAllJobs, resetPrinters } = usePrintStore();

  const printReceipt = async (orderNumber: string, branchId: string, type: ReceiptType = 'customer_receipt') => {
    return printService.createPrintJob(orderNumber, branchId, type);
  };

  const retryJob = async (jobId: string) => {
    return printService.retryPrint(jobId);
  };

  const cancelJob = async (jobId: string) => {
    return printService.cancelPrint(jobId);
  };

  const forceCompleteJob = async (jobId: string) => {
    return printService.markAsPrinted(jobId);
  };

  const getPrintersForBranch = (branchId: string) => {
    return printers[branchId] || [];
  };

  return {
    jobs,
    printers,
    printReceipt,
    retryJob,
    cancelJob,
    forceCompleteJob,
    getPrintersForBranch,
    addPrinter,
    updatePrinter,
    removePrinter,
    clearAllJobs,
    resetPrinters,
  };
}
