import { RestaurantSettings } from '@/types/settings';
import { getTenantKey } from '@/lib/security';
import { apiClient } from '@/lib/api-client';
import { PLATFORM_PREFIX } from '@/lib/constants';

export function getStoredSettings(): RestaurantSettings {
  const key = getTenantKey(`${PLATFORM_PREFIX}_settings`);
  const data = localStorage.getItem(key);
  if (!data) {
    // Provide a default structure when no data is found
    const defaultSettings: RestaurantSettings = {
      name: '',
      tagline: '',
      phone: '',
      email: '',
      currency: 'Rs.',
      logoUrl: '',
      socials: { facebook: '', instagram: '' },
      operatingHours: [],
      deliveryZones: [],
      paymentGateways: []
    };
    localStorage.setItem(key, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  return JSON.parse(data);
}

export const settingsApi = {
  getSettings: async (): Promise<RestaurantSettings> => {
    // Gap Note: The dashboard's 'Settings' module assumes a single-branch global model
    // where Operating Hours, Delivery Zones, and Payment Gateways are tenant-wide.
    // The backend uses a multi-branch architecture where these are branch-specific.
    // We fetch global settings from the backend and merge them with local fallbacks for branch-specific lists.

    const tenantId = localStorage.getItem(`${PLATFORM_PREFIX}_active_tenant_id`);
    let backendSettings: any = null;
    try {
      if (tenantId) {
        backendSettings = await apiClient.get('/tenant/current');
      }
    } catch (e) {
      console.warn("Failed to fetch tenant settings from backend", e);
    }

    const localSettings = getStoredSettings();

    if (backendSettings) {
      return {
        ...localSettings,
        name: backendSettings.name || localSettings.name,
        tagline: backendSettings.content?.heroTitle || localSettings.tagline,
        phone: backendSettings.settings?.phone || localSettings.phone,
        email: backendSettings.settings?.email || localSettings.email,
        currency: backendSettings.settings?.currencySymbol || localSettings.currency,
        logoUrl: backendSettings.theme?.logoUrl || '',
        socials: {
          facebook: backendSettings.content?.copyConfig?.facebook || '',
          instagram: backendSettings.content?.copyConfig?.instagram || '',
        },
        operatingHours: backendSettings.settings?.operatingHours || localSettings.operatingHours,
        deliveryZones: Array.isArray(backendSettings.settings?.deliveryAreas) 
          ? backendSettings.settings.deliveryAreas 
          : localSettings.deliveryZones,
      };
    }

    return localSettings;
  },

  saveSettings: async (settings: RestaurantSettings): Promise<RestaurantSettings> => {
    // Gap: Since we are merging backend fields with local fallbacks, saving should ideally
    // hit the backend for supported fields. 
    // We will save to local storage as fallback, and attempt to save global fields to backend.

    const key = getTenantKey(`${PLATFORM_PREFIX}_settings`);
    localStorage.setItem(key, JSON.stringify(settings));

    try {
      // Update tenant settings
      await apiClient.put('/tenant/settings', {
        currencySymbol: settings.currency,
        email: settings.email,
        phone: settings.phone,
        operatingHours: settings.operatingHours,
        deliveryAreas: settings.deliveryZones
      });
      // Content update for tagline and socials is possible but omitted here for simplicity
    } catch (e) {
      console.warn("Failed to sync some settings to backend", e);
    }

    return settings;
  }
};
