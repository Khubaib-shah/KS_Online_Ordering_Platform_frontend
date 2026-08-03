import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface DeviceStatus {
  deviceId: string;
  isPaired: boolean;
  pairingCode?: string;
  tenantId?: string;
  branchId?: string;
  cloudConnected: boolean;
  computerName?: string;
  localIp?: string;
}

export function usePrinterService() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [printers, setPrinters] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:8082/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setIsConnected(true);
        const data = await response.json();
        setDeviceStatus(data);
      } else {
        setIsConnected(false);
        setDeviceStatus(null);
      }
    } catch (error) {
      setIsConnected(false);
      setDeviceStatus(null);
    } finally {
      setIsChecking(false);
    }
  };

  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch('http://localhost:8082/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setDeviceStatus(data);
        return data as DeviceStatus;
      }
    } catch (error) {
      console.error('Failed to fetch device status:', error);
    }
    return null;
  };

  const scanPrinters = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('http://localhost:8082/printers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setPrinters(data.printers || []);
      }
    } catch (error) {
      console.error('Failed to scan printers:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const printRawReceipt = async (printerName: string, content: string) => {
    try {
      const response = await fetch('http://localhost:8082/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerName, content })
      });
      return response.ok;
    } catch (error) {
      console.error('Print failed:', error);
      return false;
    }
  };

  const testPrint = async (printerName: string) => {
    const content = '--------------------------------\n      INDOLJ POS SYSTEM\n--------------------------------\n\nTest print successful!\nPrinter: ' + printerName + '\nStatus: ONLINE\n\nThank you for using Indolj.\n--------------------------------\n';
    return await printRawReceipt(printerName, content);
  };

  // Pair a printer device via the cloud backend API
  const pairDevice = async (pairingCode: string, branchId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await apiClient.post('/printer/pair', { pairingCode, branchId });
      // After successful pairing, refresh device status
      await fetchDeviceStatus();
      return { success: true, message: (result as any)?.message || 'Printer paired successfully!' };
    } catch (error: any) {
      const message = error?.error || error?.message || 'Failed to pair printer. Please try again.';
      return { success: false, message };
    }
  };

  // Unpair the local printer service
  const unpairDevice = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8082/unpair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        await fetchDeviceStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unpair device:', error);
      return false;
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isChecking,
    checkConnection,
    printers,
    isScanning,
    scanPrinters,
    testPrint,
    printRawReceipt,
    deviceStatus,
    fetchDeviceStatus,
    pairDevice,
    unpairDevice,
  };
}
