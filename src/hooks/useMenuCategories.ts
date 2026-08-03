import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types/menu';
import { menuApi } from '../lib/api/menu.api';

export function useMenuCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await menuApi.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const saveCategory = async (cat: Category) => {
    try {
      const saved = await menuApi.saveCategory(cat);
      setCategories(prev => {
        const idx = prev.findIndex(c => c.id === cat.id);
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

  const reorderCategories = async (newOrder: Category[]) => {
    setCategories(newOrder); // Optimistic
    try {
      await menuApi.reorderCategories(newOrder);
    } catch (err) {
      console.error(err);
      fetchCategories(); // Revert
    }
  };

  const deleteCategory = async (id: string, fallbackCategoryId: string) => {
    try {
      await menuApi.deleteCategory(id, fallbackCategoryId);
      await fetchCategories(); // Full reload to refresh dynamic counts and reassigned items
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    saveCategory,
    reorderCategories,
    deleteCategory
  };
}
