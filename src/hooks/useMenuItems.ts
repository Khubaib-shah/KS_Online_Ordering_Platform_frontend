import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types/menu';
import { menuApi } from '../lib/api/menu.api';

const preloadedUrls = new Set<string>();

function preloadImage(url: string) {
  if (!url || preloadedUrls.has(url)) return;
  preloadedUrls.add(url);
  const img = new Image();
  img.src = url;
}

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await menuApi.getMenuItems();
      setItems(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (items.length > 0) {
      // Preload images in the background to ensure they are cached by the browser
      const timer = setTimeout(() => {
        items.forEach(item => {
          if (item.image) {
            preloadImage(item.image);
          }
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [items]);

  const saveItem = async (item: MenuItem) => {
    try {
      const saved = await menuApi.saveMenuItem(item);
      setItems(prev => {
        const idx = prev.findIndex(i => i.id === item.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await menuApi.deleteMenuItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const bulkUpdateAvailability = async (itemIds: string[], isAvailable: boolean) => {
    try {
      await menuApi.bulkUpdateAvailability(itemIds, isAvailable);
      setItems(prev => prev.map(item => itemIds.includes(item.id) ? { ...item, isAvailable } : item));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const bulkReassignCategory = async (itemIds: string[], targetCategoryName: string) => {
    try {
      await menuApi.bulkReassignCategory(itemIds, targetCategoryName);
      setItems(prev => prev.map(item => itemIds.includes(item.id) ? { ...item, category: targetCategoryName } : item));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const bulkDeleteItems = async (itemIds: string[]) => {
    try {
      await menuApi.bulkDeleteItems(itemIds);
      setItems(prev => prev.filter(item => !itemIds.includes(item.id)));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    saveItem,
    deleteItem,
    bulkUpdateAvailability,
    bulkReassignCategory,
    bulkDeleteItems
  };
}
