import { DeliverySettings } from '@/types/delivery';
import { getTenantKey } from '@/lib/security';
import { PLATFORM_PREFIX } from '@/lib/constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const KEY = `${PLATFORM_PREFIX}_delivery_settings`;

const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  deliveryFee: 150,
  minOrderValue: 500,
  estimatedDeliveryTime: 45,
  serviceableAreas: ['Clifton', 'Defence Phase 5', 'Defence Phase 6', 'Gulshan-e-Iqbal', 'Bahadurabad', 'PECHS Block 2', 'PECHS Block 6'],
  pickupEnabled: true,
  pickupInstructions: 'Please pull up to our valet/curbside zone and call. Our staff will bring your hot order out.'
};

export function getStoredDeliverySettings(): DeliverySettings {
  const key = getTenantKey(KEY);
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(DEFAULT_DELIVERY_SETTINGS));
    return DEFAULT_DELIVERY_SETTINGS;
  }
  return JSON.parse(data);
}

export const deliveryApi = {
  getSettings: async (): Promise<DeliverySettings> => {
    await delay(200);
    return getStoredDeliverySettings();
  },

  saveSettings: async (settings: DeliverySettings): Promise<DeliverySettings> => {
    await delay(300);
    const key = getTenantKey(KEY);
    localStorage.setItem(key, JSON.stringify(settings));
    return settings;
  }
};
