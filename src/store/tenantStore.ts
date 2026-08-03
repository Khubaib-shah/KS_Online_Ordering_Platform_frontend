import { create } from 'zustand';
import { Tenant } from '@/types/tenant';
import { tenantsApi } from '@/lib/api/tenants.api';
import { getCurrentUser, canUserAccessTenant, getAuthorizedTenantId } from '@/lib/security';
import { useBranchStore } from '@/store/branchStore';
import { useUIStore } from '@/store/uiStore';
import { PLATFORM_PREFIX } from '@/lib/constants';

const defaultTenants: Tenant[] = [];

const initialTenants = () => {
  const stored = localStorage.getItem(`${PLATFORM_PREFIX}_tenants`);
  if (stored) {
    try {
      return JSON.parse(stored) as Tenant[];
    } catch {
      return defaultTenants;
    }
  }
  localStorage.setItem(`${PLATFORM_PREFIX}_tenants`, JSON.stringify(defaultTenants));
  return defaultTenants;
};

const getInitialActiveTenantId = () => {
  const user = getCurrentUser();
  const savedId = localStorage.getItem(`${PLATFORM_PREFIX}_active_tenant_id`) || 'indolj-main';
  return getAuthorizedTenantId(user, savedId);
};

const getInitialActiveTenant = (id: string, tenantsList: Tenant[]) => {
  return tenantsList.find(t => t.id === id) || tenantsList[0] || null;
};

interface TenantState {
  activeTenantId: string;
  activeTenant: Tenant | null;
  tenants: Tenant[];
  detailedTenant: Tenant | null;
  setActiveTenantId: (id: string) => void;
  fetchTenants: () => Promise<void>;
  saveTenant: (tenant: Tenant) => Promise<Tenant>;
  deleteTenant: (id: string) => Promise<void>;
  setDetailedTenant: (tenant: Tenant | null) => void;
}

let isFetchingTenants = false;

export const useTenantStore = create<TenantState>((set, get) => {
  const loadedTenants = initialTenants();
  const initActiveId = getInitialActiveTenantId();
  const initActiveTenant = getInitialActiveTenant(initActiveId, loadedTenants);

  return {
    activeTenantId: initActiveId,
    activeTenant: initActiveTenant,
    tenants: loadedTenants,
    detailedTenant: null,

    setActiveTenantId: (id) => {
      const user = getCurrentUser();
      const matched = get().tenants.find(t => t.id === id) || null;

      // Secure guard: Non-super-admins CANNOT change context to another tenant
      if (!canUserAccessTenant(user, id)) {
        useUIStore.getState().addToast('Unauthorized tenant switch attempted', 'error');
        return;
      }

      localStorage.setItem(`${PLATFORM_PREFIX}_active_tenant_id`, id);
      set({
        activeTenantId: id,
        activeTenant: matched,
      });

      useBranchStore.getState().loadTenantBranches();
      useUIStore.getState().addToast(`Context switched to ${matched ? matched.name : id}`, 'info');
    },

    fetchTenants: async () => {
      if (isFetchingTenants) return;
      isFetchingTenants = true;
      try {
        const list = await tenantsApi.getTenants();
        set({ tenants: list });
        localStorage.setItem(`${PLATFORM_PREFIX}_tenants`, JSON.stringify(list));

        const matched = list.find(t => t.id === get().activeTenantId) || null;
        set({ activeTenant: matched });
      } catch (e) {
        console.error("Failed to fetch tenants", e);
      } finally {
        isFetchingTenants = false;
      }
    },

    saveTenant: async (tenant) => {
      const saved = await tenantsApi.saveTenant(tenant);
      const updatedList = get().tenants.map(t => t.id === tenant.id ? saved : t);
      if (!get().tenants.some(t => t.id === tenant.id)) {
        updatedList.push(saved);
      }
      set({ tenants: updatedList });
      localStorage.setItem(`${PLATFORM_PREFIX}_tenants`, JSON.stringify(updatedList));

      if (get().activeTenantId === tenant.id) {
        set({ activeTenant: saved });
      }
      useUIStore.getState().addToast(`Tenant ${tenant.name} saved successfully`, 'success');
      return saved;
    },

    deleteTenant: async (id) => {
      await tenantsApi.deleteTenant(id);
      const updatedList = get().tenants.filter(t => t.id !== id);
      set({ tenants: updatedList });
      localStorage.setItem(`${PLATFORM_PREFIX}_tenants`, JSON.stringify(updatedList));

      if (get().activeTenantId === id) {
        const fallback = updatedList[0] || null;
        set({
          activeTenantId: fallback ? fallback.id : 'indolj-main',
          activeTenant: fallback,
        });
      }
      useUIStore.getState().addToast('Tenant deleted successfully', 'success');
    },

    setDetailedTenant: (tenant) => set({ detailedTenant: tenant }),
  };
});
