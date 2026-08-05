import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi } from '../lib/api/tables.api';
import { useAuthStore } from '../store/authStore';

export function useTables(branchId?: string) {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuthStore();

  const { data: tables = [], isLoading, error } = useQuery({
    queryKey: ['tables', branchId],
    queryFn: () => tablesApi.getTables(branchId!),
    enabled: isLoggedIn && !!branchId,
  });

  const createTable = useMutation({
    mutationFn: tablesApi.createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });

  const updateTable = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof tablesApi.updateTable>[1] }) => tablesApi.updateTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });

  const deleteTable = useMutation({
    mutationFn: tablesApi.deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', branchId] });
    },
  });

  return {
    tables,
    isLoading,
    error,
    createTable,
    updateTable,
    deleteTable,
  };
}
