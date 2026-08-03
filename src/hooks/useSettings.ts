import { useState, useEffect, useCallback } from 'react';
import { RestaurantSettings } from '../types/settings';
import { DeliverySettings } from '../types/delivery';
import { settingsApi } from '../lib/api/settings.api';
import { deliveryApi } from '../lib/api/delivery.api';

export function useSettings() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sData, dData] = await Promise.all([
        settingsApi.getSettings(),
        deliveryApi.getSettings()
      ]);
      setSettings(sData);
      setDeliverySettings(dData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  const saveGeneralSettings = async (newSettings: RestaurantSettings) => {
    try {
      const saved = await settingsApi.saveSettings(newSettings);
      setSettings(saved);
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const saveDeliverySettings = async (newDelivery: DeliverySettings) => {
    try {
      const saved = await deliveryApi.saveSettings(newDelivery);
      setDeliverySettings(saved);
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    settings,
    deliverySettings,
    isLoading,
    error,
    refetch: fetchAllSettings,
    saveGeneralSettings,
    saveSettings: saveGeneralSettings,
    saveDeliverySettings
  };
}
