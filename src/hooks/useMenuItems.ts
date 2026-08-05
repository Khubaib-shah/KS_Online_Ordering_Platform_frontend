import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ['menu-items'],
    queryFn: menuApi.getMenuItems,
  });

  useEffect(() => {
    if (items.length > 0) {
      // Preload images in the background to ensure they are cached by the browser
      const timer = setTimeout(() => {
        items.forEach((item: MenuItem) => {
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
      queryClient.setQueryData(['menu-items'], (old: MenuItem[] | undefined) => {
        if (!old) return [saved];
        const idx = old.findIndex(i => i.id === item.id);
        if (idx !== -1) {
          const updated = [...old];
          updated[idx] = saved;
          return updated;
        }
        return [...old, saved];
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
      queryClient.setQueryData(['menu-items'], (old: MenuItem[] | undefined) => 
        old ? old.filter(i => i.id !== id) : []
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const bulkUpdateAvailability = async (itemIds: string[], isAvailable: boolean) => {
    try {
      await menuApi.bulkUpdateAvailability(itemIds, isAvailable);
      queryClient.setQueryData(['menu-items'], (old: MenuItem[] | undefined) => 
        old ? old.map(item => itemIds.includes(item.id) ? { ...item, isAvailable } : item) : []
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const toggleOnlineAvailability = async (itemId: string, availableOnline: boolean) => {
    try {
      await menuApi.toggleOnlineAvailability(itemId, availableOnline);
      queryClient.setQueryData(['menu-items'], (old: MenuItem[] | undefined) => 
        old ? old.map(item => item.id === itemId ? { ...item, availableOnline } : item) : []
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const bulkReassignCategory = async (itemIds: string[], targetCategoryName: string) => {
    try {
      await menuApi.bulkReassignCategory(itemIds, targetCategoryName);
      queryClient.setQueryData(['menu-items'], (old: MenuItem[] | undefined) => 
        old ? old.map(item => itemIds.includes(item.id) ? { ...item, category: targetCategoryName } : item) : []
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const bulkDeleteItems = async (itemIds: string[]) => {
    try {
      await menuApi.bulkDeleteItems(itemIds);
      queryClient.setQueryData(['menu-items'], (old: MenuItem[] | undefined) => 
        old ? old.filter(item => !itemIds.includes(item.id)) : []
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    items,
    isLoading,
    error,
    refetch,
    saveItem,
    deleteItem,
    bulkUpdateAvailability,
    toggleOnlineAvailability,
    bulkReassignCategory,
    bulkDeleteItems
  };
}
