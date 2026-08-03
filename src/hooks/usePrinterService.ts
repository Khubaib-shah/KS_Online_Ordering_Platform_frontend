import { useState, useEffect } from 'react';

export function usePrinterService() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [printers, setPrinters] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:8082/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
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
    printRawReceipt
  };
}
