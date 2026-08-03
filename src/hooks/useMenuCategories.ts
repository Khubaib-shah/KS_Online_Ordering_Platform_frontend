import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Category } from '../types/menu';
import { menuApi } from '../lib/api/menu.api';

export function useMenuCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.getCategories,
  });

  const saveCategory = async (cat: Category) => {
    try {
      const saved = await menuApi.saveCategory(cat);
      queryClient.setQueryData(['categories'], (old: Category[] | undefined) => {
        if (!old) return [saved];
        const idx = old.findIndex(c => c.id === cat.id);
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

  const reorderCategories = async (newOrder: Category[]) => {
    // Optimistic
    queryClient.setQueryData(['categories'], newOrder); 
    try {
      await menuApi.reorderCategories(newOrder);
    } catch (err) {
      console.error(err);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  };

  const deleteCategory = async (id: string, fallbackCategoryId: string) => {
    try {
      await menuApi.deleteCategory(id, fallbackCategoryId);
      // Full reload to refresh dynamic counts and reassigned items
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    refetch,
    saveCategory,
    reorderCategories,
    deleteCategory
  };
}
