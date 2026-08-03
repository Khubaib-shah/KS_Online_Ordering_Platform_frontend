import { create } from 'zustand';

interface PWAStore {
  deferredPrompt: any;
  isInstallable: boolean;
  setDeferredPrompt: (prompt: any) => void;
  setIsInstallable: (val: boolean) => void;
  installPWA: () => Promise<void>;
}

export const usePWAStore = create<PWAStore>((set, get) => ({
  deferredPrompt: null,
  isInstallable: false,
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  setIsInstallable: (val) => set({ isInstallable: val }),
  
  installPWA: async () => {
    const { deferredPrompt } = get();
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    set({ deferredPrompt: null, isInstallable: false });
  }
}));
