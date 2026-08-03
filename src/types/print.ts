export type PrinterStatus = 'online' | 'offline' | 'error';
export type PrinterType = 'receipt' | 'kitchen' | 'label';
export type PrintJobStatus = 'pending' | 'printing' | 'printed' | 'failed' | 'cancelled';
export type ReceiptType = 'customer_receipt' | 'kitchen_docket' | 'invoice';

export interface PrinterConfig {
  id: string;
  name: string;
  type: PrinterType;
  status: PrinterStatus;
  interface: 'usb' | 'network' | 'bluetooth';
  connectionString: string; // e.g. "192.168.1.100:9100" or "USB001"
  paperWidth: '80mm' | '58mm';
  isDefault: boolean;
}

export interface PrintJob {
  id: string;
  orderId: string;
  orderNumber: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  printerId: string;
  printerName: string;
  receiptType: ReceiptType;
  status: PrintJobStatus;
  createdTime: string;
  printedTime?: string;
  retryCount: number;
  errorMessage?: string;
  documentUrl?: string; // Blob URL of the generated PDF
}

export interface PrintQueueState {
  jobs: PrintJob[];
  printers: Record<string, PrinterConfig[]>; // branchId -> printers
}
