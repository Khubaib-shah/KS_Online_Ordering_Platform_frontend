import { apiClient } from '../api-client';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  _count?: {
    staffProfiles: number;
  };
  createdAt?: string;
}

export const rolesApi = {
  getRoles: async (): Promise<Role[]> => {
    const res = await apiClient.get<{ success: boolean; data: Role[] }>('/roles');
    return res as unknown as Role[];
  },

  createRole: async (data: Partial<Role>): Promise<Role> => {
    const res = await apiClient.post<{ success: boolean; data: Role }>('/roles', data);
    return res as unknown as Role;
  },

  updateRole: async (id: string, data: Partial<Role>): Promise<Role> => {
    const res = await apiClient.put<{ success: boolean; data: Role }>(`/roles/${id}`, data);
    return res as unknown as Role;
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  }
};
