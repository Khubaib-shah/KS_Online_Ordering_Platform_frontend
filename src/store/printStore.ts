import { create } from 'zustand';
import { PrintJob, PrinterConfig } from '@/types/print';
import { PLATFORM_PREFIX } from '@/lib/constants';
interface PrintStoreState {
  jobs: PrintJob[];
  printers: Record<string, PrinterConfig[]>; // branchId -> printers list
  activeJobsCount: () => number;

  // Actions
  addPrintJob: (job: Omit<PrintJob, 'id' | 'createdTime' | 'retryCount' | 'status'>) => PrintJob;
  updatePrintJob: (jobId: string, updates: Partial<PrintJob>) => void;
  removePrintJob: (jobId: string) => void;
  clearAllJobs: () => void;

  // Printer Actions
  addPrinter: (branchId: string, printer: Omit<PrinterConfig, 'id'>) => void;
  updatePrinter: (branchId: string, printerId: string, updates: Partial<PrinterConfig>) => void;
  removePrinter: (branchId: string, printerId: string) => void;
  resetPrinters: () => void;
}

const STORAGE_KEY_JOBS = `${PLATFORM_PREFIX}_print_jobs`;
const STORAGE_KEY_PRINTERS = `${PLATFORM_PREFIX}_branch_printers`;

// Default printer configs mapped by branchIds
const getDefaultPrinters = (branches: { id: string }[] = []): Record<string, PrinterConfig[]> => {
  const configs: Record<string, PrinterConfig[]> = {};

  // Seed a single generic default printer for provided branches
  branches.forEach((branch) => {
    configs[branch.id] = [
      {
        id: `${branch.id}-receipt-p`,
        name: 'Main Counter Receipt Printer',
        type: 'receipt',
        status: 'online',
        interface: 'usb',
        connectionString: 'USB001',
        paperWidth: '80mm',
        isDefault: true,
      }
    ];
  });

  return configs;
};

export const usePrintStore = create<PrintStoreState>((set, get) => {
  // Load initial jobs
  const initialJobs = (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_JOBS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  // Load initial printers
  const initialPrinters = (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRINTERS);
      return stored ? JSON.parse(stored) : getDefaultPrinters();
    } catch {
      return getDefaultPrinters();
    }
  })();

  const saveJobsToStorage = (jobs: PrintJob[]) => {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
  };

  const savePrintersToStorage = (printers: Record<string, PrinterConfig[]>) => {
    localStorage.setItem(STORAGE_KEY_PRINTERS, JSON.stringify(printers));
  };

  return {
    jobs: initialJobs,
    printers: initialPrinters,

    activeJobsCount: () => {
      return get().jobs.filter(j => j.status === 'pending' || j.status === 'printing').length;
    },

    addPrintJob: (jobInput) => {
      const newJob: PrintJob = {
        ...jobInput,
        id: `job-${Math.floor(Math.random() * 900000 + 100000)}`,
        status: 'pending',
        createdTime: new Date().toISOString(),
        retryCount: 0,
      };

      set((state) => {
        const updatedJobs = [newJob, ...state.jobs].slice(0, 50); // limit queue to 50 items
        saveJobsToStorage(updatedJobs);
        return { jobs: updatedJobs };
      });

      return newJob;
    },

    updatePrintJob: (jobId, updates) => {
      set((state) => {
        const updatedJobs = state.jobs.map((job) =>
          job.id === jobId ? { ...job, ...updates } : job
        );
        saveJobsToStorage(updatedJobs);
        return { jobs: updatedJobs };
      });
    },

    removePrintJob: (jobId) => {
      set((state) => {
        const updatedJobs = state.jobs.filter((job) => job.id !== jobId);
        saveJobsToStorage(updatedJobs);
        return { jobs: updatedJobs };
      });
    },

    clearAllJobs: () => {
      set(() => {
        saveJobsToStorage([]);
        return { jobs: [] };
      });
    },

    addPrinter: (branchId, printerInput) => {
      set((state) => {
        const branchPrinters = state.printers[branchId] || [];
        const newPrinter: PrinterConfig = {
          ...printerInput,
          id: `printer-${Math.floor(Math.random() * 90000 + 10000)}`,
        };

        // If set as default, unset others of same type
        const updatedPrinters = branchPrinters.map((p) =>
          newPrinter.isDefault && p.type === newPrinter.type ? { ...p, isDefault: false } : p
        );

        const nextPrinters = {
          ...state.printers,
          [branchId]: [...updatedPrinters, newPrinter],
        };
        savePrintersToStorage(nextPrinters);
        return { printers: nextPrinters };
      });
    },

    updatePrinter: (branchId, printerId, updates) => {
      set((state) => {
        const branchPrinters = state.printers[branchId] || [];
        const updatedPrinters = branchPrinters.map((p) => {
          if (p.id === printerId) {
            const result = { ...p, ...updates };
            return result;
          }
          // If updates set as default, unset other printers of the same type in this branch
          if (updates.isDefault && p.type === updates.type) {
            return { ...p, isDefault: false };
          }
          return p;
        });

        const nextPrinters = {
          ...state.printers,
          [branchId]: updatedPrinters,
        };
        savePrintersToStorage(nextPrinters);
        return { printers: nextPrinters };
      });
    },

    removePrinter: (branchId, printerId) => {
      set((state) => {
        const branchPrinters = state.printers[branchId] || [];
        const nextPrinters = {
          ...state.printers,
          [branchId]: branchPrinters.filter((p) => p.id !== printerId),
        };
        savePrintersToStorage(nextPrinters);
        return { printers: nextPrinters };
      });
    },

    resetPrinters: () => {
      const defaultPrinters = getDefaultPrinters();
      set(() => {
        savePrintersToStorage(defaultPrinters);
        return { printers: defaultPrinters };
      });
    },
  };
});
