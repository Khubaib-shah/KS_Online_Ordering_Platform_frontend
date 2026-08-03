import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { ReceiptDocument } from '../components/receipt/ReceiptDocument';
import { Order } from '../types/order';
import { Tenant } from '../types/tenant';
import { Branch } from '../types/branch';
import { ReceiptType } from '../types/print';

export const receiptService = {
  /**
   * Generates a PDF Blob for the specified order, tenant, and branch.
   * This is fully asynchronous and runs off the main thread.
   */
  async generateReceiptBlob(
    order: Order,
    tenant: Tenant | null,
    branch: Branch | null,
    receiptType: ReceiptType
  ): Promise<Blob> {
    try {
      // Instantiate the react-pdf render engine
      const doc = React.createElement(ReceiptDocument, {
        order,
        tenant,
        branch,
        receiptType,
      });
      
      const pdfInstance = pdf(doc as any);
      const blob = await pdfInstance.toBlob();
      return blob;
    } catch (err) {
      console.error('Error generating PDF Blob inside receiptService:', err);
      throw new Error('Failed to render PDF document.');
    }
  },

  /**
   * Generates a temporary browser URL (Blob URL) for previewing or printing.
   */
  async generateReceiptUrl(
    order: Order,
    tenant: Tenant | null,
    branch: Branch | null,
    receiptType: ReceiptType
  ): Promise<string> {
    const blob = await this.generateReceiptBlob(order, tenant, branch, receiptType);
    return URL.createObjectURL(blob);
  }
};
