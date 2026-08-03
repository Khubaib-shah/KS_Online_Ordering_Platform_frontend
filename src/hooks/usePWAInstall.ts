import { useEffect } from 'react';
import { useTenantStore } from '../store/tenantStore';
import { usePWAStore } from '../store/pwaStore';

export function useGlobalPWA() {
  const { activeTenant } = useTenantStore();
  const { setDeferredPrompt, setIsInstallable } = usePWAStore();

  useEffect(() => {
    if (!activeTenant) return;

    const manifest = {
      name: activeTenant.name || 'KS POS System',
      short_name: activeTenant.name || 'KS POS',
      description: 'Online Ordering Platform',
      theme_color: activeTenant.brandColor || '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: activeTenant.logoUrl || '/icon.svg',
          sizes: '192x192',
          purpose: 'any maskable'
        },
        {
          src: activeTenant.logoUrl || '/icon.svg',
          sizes: '512x512',
          purpose: 'any maskable'
        }
      ]
    };

    const manifestString = JSON.stringify(manifest);
    const blob = new Blob([manifestString], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(blob);

    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestUrl;

    return () => {
      URL.revokeObjectURL(manifestUrl);
    };
  }, [activeTenant]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, setIsInstallable]);
}
