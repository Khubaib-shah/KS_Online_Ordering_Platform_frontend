import { apiClient } from '@/lib/api-client';
import { Branch, InventoryItem, StockMovement } from '@/types/branch';
import { PLATFORM_PREFIX } from '@/lib/constants';

const mapBackendBranchToFrontend = (backendBranch: any): Branch => {
  return {
    id: backendBranch.id,
    tenantId: backendBranch.tenantId || '',
    name: backendBranch.name,
    address: backendBranch.address,
    area: '',
    city: '',
    phone: backendBranch.phone || '',
    whatsapp: '',
    status: backendBranch.isActive ? 'active' : 'inactive',
  };
};

const mapFrontendBranchToBackend = (frontendBranch: any) => {
  return {
    name: frontendBranch.name,
    address: frontendBranch.address,
    phone: frontendBranch.phone,
    isActive: frontendBranch.status === 'active',
  };
};

export const branchApi = {
  getBranches: async (_tenantId: string): Promise<Branch[]> => {
    const res = await apiClient.get('/branches');
    if (Array.isArray(res)) {
      return res.map(mapBackendBranchToFrontend);
    }
    return [];
  },

  createBranch: async (_tenantId: string, branch: Omit<Branch, 'id'>): Promise<Branch> => {
    const res = await apiClient.post('/branches', mapFrontendBranchToBackend(branch));
    return mapBackendBranchToFrontend(res);
  },

  updateBranch: async (_tenantId: string, id: string, branch: Partial<Branch>): Promise<Branch> => {
    const res = await apiClient.put(`/branches/${id}`, mapFrontendBranchToBackend(branch));
    return mapBackendBranchToFrontend(res);
  },

  deleteBranch: async (_tenantId: string, id: string): Promise<void> => {
    await apiClient.delete(`/branches/${id}`);
  },

  // Legacy mock method kept for compatibility until we rewrite the UI array logic
  saveBranches: async (_tenantId: string, _branches: Branch[]) => {
    // A proper UI rewrite would avoid bulk saving, but to preserve existing UI behavior:
    // We will assume the UI is passing the full array, we won't execute full sync here
    // since it's dangerous and complex (which is why we added individual methods above).
    console.warn("saveBranches called but backend requires individual API calls.");
  },

  // --------------------------------------------------------------------------------
  // Delivery Zones
  // --------------------------------------------------------------------------------
  getDeliveryZones: async (_tenantId: string, branchId: string): Promise<any[]> => {
    try {
      const res = await apiClient.get(`/branches/${branchId}/delivery-zones`);
      if (Array.isArray(res)) {
        return res;
      }
      return [];
    } catch (e) {
      console.warn("Failed to fetch delivery zones", e);
      return [];
    }
  },

  createDeliveryZone: async (_tenantId: string, branchId: string, zone: any): Promise<any> => {
    return apiClient.post(`/branches/${branchId}/delivery-zones`, zone);
  },

  updateDeliveryZone: async (_tenantId: string, zoneId: string, zone: any): Promise<any> => {
    return apiClient.put(`/branches/delivery-zones/${zoneId}`, zone);
  },

  deleteDeliveryZone: async (_tenantId: string, zoneId: string): Promise<void> => {
    return apiClient.delete(`/branches/delivery-zones/${zoneId}`);
  },

  // --------------------------------------------------------------------------------
  // Mock Data (Gaps in Backend)
  // The backend does not yet have Inventory and Stock Movements endpoints.
  // --------------------------------------------------------------------------------

  getInventory: async (tenantId: string): Promise<InventoryItem[]> => {
    const key = `${PLATFORM_PREFIX}_inventory_${tenantId}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return [];
  },

  saveInventory: (tenantId: string, inventory: InventoryItem[]) => {
    const key = `${PLATFORM_PREFIX}_inventory_${tenantId}`;
    localStorage.setItem(key, JSON.stringify(inventory));
  },

  getStockMovements: async (tenantId: string): Promise<StockMovement[]> => {
    const key = `${PLATFORM_PREFIX}_movements_${tenantId}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return [];
  },

  saveStockMovements: (tenantId: string, movements: StockMovement[]) => {
    const key = `${PLATFORM_PREFIX}_movements_${tenantId}`;
    localStorage.setItem(key, JSON.stringify(movements));
  },

  getDisabledProducts: async (tenantId: string): Promise<Record<string, string[]>> => {
    const key = `${PLATFORM_PREFIX}_disabled_products_${tenantId}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return {};
  },

  saveDisabledProducts: (tenantId: string, disabled: Record<string, string[]>) => {
    const key = `${PLATFORM_PREFIX}_disabled_products_${tenantId}`;
    localStorage.setItem(key, JSON.stringify(disabled));
  }
};
