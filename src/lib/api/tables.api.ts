import { apiClient } from '@/lib/api-client';

export interface Table {
  id: string;
  branchId: string;
  tableNumber: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const tablesApi = {
  getTables: (branchId: string) => 
    apiClient.get<Table[]>(`/tables?branchId=${branchId}`) as any as Promise<Table[]>,
    
  createTable: (data: { branchId: string; tableNumber: string; capacity?: number; isActive?: boolean }) => 
    apiClient.post<Table>('/tables', data) as any as Promise<Table>,
    
  updateTable: (id: string, data: { tableNumber?: string; capacity?: number; isActive?: boolean }) => 
    apiClient.put<Table>(`/tables/${id}`, data) as any as Promise<Table>,
    
  deleteTable: (id: string) => 
    apiClient.delete(`/tables/${id}`) as any as Promise<void>,
};

