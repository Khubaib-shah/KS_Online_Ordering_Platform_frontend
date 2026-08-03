import { usePrintStore } from '../store/printStore';
import { useUIStore } from '../store/uiStore';
import { useTenantStore } from '../store/tenantStore';
import { receiptService } from './receipt.service';
import { PrintJob, PrinterConfig, ReceiptType } from '../types/print';
import { ordersApi } from '../lib/api/orders.api';
import { branchApi } from '../lib/api/branch.api';

export const printService = {
  /**
   * Dispatches a print job to the simulated queue and triggers the background printer state machine.
   * Maps to: POST /api/print-jobs
   */
  async createPrintJob(
    orderNumber: string,
    branchId: string,
    receiptType: ReceiptType
  ): Promise<PrintJob> {
    const printStore = usePrintStore.getState();
    const tenant = useTenantStore.getState().activeTenant;
    const tenantId = tenant?.id || 'indolj-main';

    // 1. Fetch details for document rendering
    let order = await ordersApi.getOrder(orderNumber);
    if (!order) {
      // Fallback fallback generator to handle any generated orders
      order = {
        orderNumber,
        customer: { name: 'Dining Guest', phone: '+92 300 0000000' },
        delivery: { type: 'DELIVERY' },
        items: [{ id: '1', name: 'Karahi & Naan combo', qty: 1, unitPrice: 1500, total: 1500 }],
        subtotal: 1500,
        tax: 225,
        deliveryFee: 0,
        discount: 0,
        grandTotal: 1725,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        status: 'DELIVERED',
        placedAt: new Date().toISOString(),
        timeline: [],
        notes: []
      };
    }

    const branches = await branchApi.getBranches(tenantId);
    const branch = branches.find(b => b.id === branchId) || null;
    const branchName = branch?.name || 'Main Branch';

    // 2. Select appropriate printer configured at the branch
    const branchPrinters = printStore.printers[branchId] || [];
    let selectedPrinter: PrinterConfig | undefined;

    if (receiptType === 'kitchen_docket') {
      selectedPrinter = branchPrinters.find(p => p.type === 'kitchen' && p.isDefault) ||
        branchPrinters.find(p => p.type === 'kitchen') ||
        branchPrinters.find(p => p.type === 'receipt');
    } else {
      selectedPrinter = branchPrinters.find(p => p.type === 'receipt' && p.isDefault) ||
        branchPrinters.find(p => p.type === 'receipt') ||
        branchPrinters.find(p => p.type === 'label');
    }

    if (!selectedPrinter && branchPrinters.length > 0) {
      selectedPrinter = branchPrinters[0];
    }

    const printerId = selectedPrinter?.id || 'virtual-printer';
    const printerName = selectedPrinter?.name || 'Generic Thermal Writer';

    // 3. Generate PDF receipt asynchronously as a background asset
    let documentUrl = '';
    try {
      documentUrl = await receiptService.generateReceiptUrl(order, tenant, branch, receiptType);
    } catch (e) {
      console.warn('Receipt PDF layout generation failed, fallback to text stream.', e);
    }

    // 4. Register the Job in the Zustand State Queue
    const job = printStore.addPrintJob({
      orderId: order.id || orderNumber,
      orderNumber,
      tenantId,
      branchId,
      branchName,
      printerId,
      printerName,
      receiptType,
      documentUrl,
    });

    // 5. Fire and forget simulation runner (background worker)
    this.processPrintJob(job.id, selectedPrinter);

    return job;
  },

  /**
   * Retrieves all print jobs currently queued or processed.
   * Maps to: GET /api/print-jobs
   */
  async getPrintJobs(): Promise<PrintJob[]> {
    // Simulating API Latency
    await new Promise(resolve => setTimeout(resolve, 300));
    return usePrintStore.getState().jobs;
  },

  /**
   * Cancels a pending or active job from the printer spool.
   * Maps to: DELETE /api/print-jobs/:id
   */
  async cancelPrint(jobId: string): Promise<void> {
    const printStore = usePrintStore.getState();
    printStore.updatePrintJob(jobId, { status: 'cancelled' });
    useUIStore.getState().addToast('Print job cancelled.', 'info');
  },

  /**
   * Retries printing of a failed job.
   * Maps to: POST /api/print-jobs/:id/retry
   */
  async retryPrint(jobId: string): Promise<void> {
    const printStore = usePrintStore.getState();
    const job = printStore.jobs.find(j => j.id === jobId);
    if (!job) return;

    printStore.updatePrintJob(jobId, {
      status: 'pending',
      retryCount: job.retryCount + 1,
      errorMessage: undefined,
    });

    // Resolve associated printer config
    const branchPrinters = printStore.printers[job.branchId] || [];
    const printer = branchPrinters.find(p => p.id === job.printerId);

    // Trigger background process again
    this.processPrintJob(jobId, printer);
    useUIStore.getState().addToast(`Retrying print job ${job.id}...`, 'info');
  },

  /**
   * Manually flags a job as completed (bypass simulation failures).
   * Maps to: PATCH /api/print-jobs/:id
   */
  async markAsPrinted(jobId: string): Promise<void> {
    usePrintStore.getState().updatePrintJob(jobId, {
      status: 'printed',
      printedTime: new Date().toISOString(),
      errorMessage: undefined,
    });
  },

  /**
   * Core State Machine Simulation: Pend -> Print Spool -> Device Connect -> Written.
   */
  processPrintJob(jobId: string, printer?: PrinterConfig) {
    const printStore = usePrintStore.getState();
    const uiStore = useUIStore.getState();

    // Delay 1: Connect & Spooling (800ms)
    setTimeout(() => {
      // Re-verify that the job was not cancelled in the interim
      const currentJob = printStore.jobs.find(j => j.id === jobId);
      if (!currentJob || currentJob.status === 'cancelled') return;

      printStore.updatePrintJob(jobId, { status: 'printing' });

      // Delay 2: Written to paper head (1.5s)
      setTimeout(() => {
        const finalJobState = usePrintStore.getState().jobs.find(j => j.id === jobId);
        if (!finalJobState || finalJobState.status === 'cancelled') return;

        // Determine device status
        const deviceStatus = printer?.status || 'online';

        if (deviceStatus === 'online') {
          printStore.updatePrintJob(jobId, {
            status: 'printed',
            printedTime: new Date().toISOString(),
          });
          uiStore.addToast(`Receipt printed successfully at ${currentJob.branchName}`, 'success');
        } else if (deviceStatus === 'offline') {
          printStore.updatePrintJob(jobId, {
            status: 'failed',
            errorMessage: `Target printer [${printer?.name}] is currently offline. Ensure network is connected.`,
          });
          uiStore.addToast(`Printing failed: Printer is offline.`, 'error');
        } else {
          // 'error' status (e.g. Paper jam or out of rolls)
          printStore.updatePrintJob(jobId, {
            status: 'failed',
            errorMessage: `Paper Jam or Out of Paper error reported by ${printer?.name || 'Counter Printer'}.`,
          });
          uiStore.addToast(`Printing failed: Paper jam/out of paper.`, 'error');
        }
      }, 1500);

    }, 800);
  }
};
