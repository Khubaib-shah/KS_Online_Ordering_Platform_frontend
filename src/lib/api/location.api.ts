import { apiClient } from '@/lib/api-client';

export const locationApi = {
  // Cities
  getAllCities: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get<any, any>('/location/admin/cities');
      return Array.isArray(res) ? res : [];
    } catch (e) {
      console.error('Failed to fetch cities', e);
      return [];
    }
  },
  
  createCity: async (data: { name: string; slug: string; isActive?: boolean }): Promise<any> => {
    return await apiClient.post<any, any>('/location/admin/cities', data);
  },
  
  updateCity: async (id: string, data: { name?: string; slug?: string; isActive?: boolean }): Promise<any> => {
    return await apiClient.put<any, any>(`/location/admin/cities/${id}`, data);
  },
  
  deleteCity: async (id: string): Promise<void> => {
    await apiClient.delete<any>(`/location/admin/cities/${id}`);
  },

  restoreCity: async (id: string): Promise<any> => {
    return await apiClient.post<any, any>(`/location/admin/cities/${id}/restore`);
  },

  // Zones
  getCityZones: async (cityId: string): Promise<any[]> => {
    try {
      const res = await apiClient.get<any, any>(`/location/admin/cities/${cityId}/zones`);
      return Array.isArray(res) ? res : [];
    } catch (e) {
      console.error('Failed to fetch zones', e);
      return [];
    }
  },

  createZone: async (cityId: string, data: { name: string; slug: string; isActive?: boolean }): Promise<any> => {
    return await apiClient.post<any, any>(`/location/admin/cities/${cityId}/zones`, data);
  },

  updateZone: async (id: string, data: { name?: string; slug?: string; isActive?: boolean }): Promise<any> => {
    return await apiClient.put<any, any>(`/location/admin/zones/${id}`, data);
  },

  deleteZone: async (id: string): Promise<void> => {
    await apiClient.delete<any>(`/location/admin/zones/${id}`);
  },

  restoreZone: async (id: string): Promise<any> => {
    return await apiClient.post<any, any>(`/location/admin/zones/${id}/restore`);
  },

  // Areas
  getZoneAreas: async (zoneId: string): Promise<any[]> => {
    try {
      const res = await apiClient.get<any, any>(`/location/admin/zones/${zoneId}/areas`);
      return Array.isArray(res) ? res : [];
    } catch (e) {
      console.error('Failed to fetch areas', e);
      return [];
    }
  },

  createArea: async (zoneId: string, data: { name: string; slug: string; isActive?: boolean }): Promise<any> => {
    return await apiClient.post<any, any>(`/location/admin/zones/${zoneId}/areas`, data);
  },

  updateArea: async (id: string, data: { name?: string; slug?: string; isActive?: boolean }): Promise<any> => {
    return await apiClient.put<any, any>(`/location/admin/areas/${id}`, data);
  },

  deleteArea: async (id: string): Promise<void> => {
    await apiClient.delete<any>(`/location/admin/areas/${id}`);
  },

  restoreArea: async (id: string): Promise<any> => {
    return await apiClient.post<any, any>(`/location/admin/areas/${id}/restore`);
  },
};
