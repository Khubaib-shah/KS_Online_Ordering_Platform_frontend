import { create } from 'zustand';
import { Branch, InventoryItem, StockMovement } from '@/types/branch';
import { useTenantStore } from '@/store/tenantStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { isOwnerOrSuper } from '@/lib/security';
import { PLATFORM_PREFIX } from '@/lib/constants';
import { branchApi } from '@/lib/api/branch.api';

interface BranchState {
  branches: Branch[];
  activeBranchFilterId: string;
  customerSelectedBranchId: string;
  customerSelectedArea: string;
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  disabledProducts: Record<string, string[]>;
  setBranchFilter: (branchId: string) => void;
  setCustomerLocation: (area: string, branchId: string) => void;
  loadTenantBranches: () => Promise<void>;
  saveBranch: (branch: Branch) => Promise<void>;
  deleteBranch: (branchId: string) => Promise<void>;
  saveInventoryList: (inventory: InventoryItem[]) => void;
  addStockMovement: (branchId: string, itemName: string, type: 'in' | 'out', qty: number, reason: string) => void;
  toggleProductBranch: (branchId: string, itemId: string) => void;
}

export const useBranchStore = create<BranchState>((set, get) => {
  // Read initial properties dynamically on store instantiation
  const initActiveTenantId = localStorage.getItem(`${PLATFORM_PREFIX}_active_tenant_id`) || 'indolj-main';
  const initialCustomerBranchId = localStorage.getItem(`${PLATFORM_PREFIX}_customer_branch_${initActiveTenantId}`) || '';
  const initialCustomerArea = localStorage.getItem(`${PLATFORM_PREFIX}_customer_area_${initActiveTenantId}`) || '';

  return {
    branches: [],
    activeBranchFilterId: 'all',
    customerSelectedBranchId: initialCustomerBranchId,
    customerSelectedArea: initialCustomerArea,
    inventory: [],
    stockMovements: [],
    disabledProducts: {},

    setBranchFilter: (branchId) => {
      const user = useAuthStore.getState().currentUser;
      if (user && !isOwnerOrSuper(user) && user.assignedBranchId && user.assignedBranchId !== branchId) {
        useUIStore.getState().addToast('Employees cannot switch branch filters.', 'error');
        return;
      }
      set({ activeBranchFilterId: branchId });
      useUIStore.getState().addToast(`Branch filter updated`, 'info');
    },

    setCustomerLocation: (area, branchId) => {
      const tenantId = useTenantStore.getState().activeTenantId;
      localStorage.setItem(`${PLATFORM_PREFIX}_customer_branch_${tenantId}`, branchId);
      localStorage.setItem(`${PLATFORM_PREFIX}_customer_area_${tenantId}`, area);
      set({
        customerSelectedArea: area,
        customerSelectedBranchId: branchId,
      });
      useUIStore.getState().addToast(`Location set to ${area}. Branch: ${get().branches.find(b => b.id === branchId)?.name || 'Mapped Branch'}`, 'success');
    },
    loadTenantBranches: async () => {
      const isLoggedIn = useAuthStore.getState().isLoggedIn;
      if (!isLoggedIn) return;

      const tenantId = useTenantStore.getState().activeTenantId;
      const user = useAuthStore.getState().currentUser;
      try {
        const bList = await branchApi.getBranches(tenantId);
        set({
          branches: bList,
          activeBranchFilterId: user && user.assignedBranchId ? user.assignedBranchId : 'all',
          customerSelectedBranchId: localStorage.getItem(`${PLATFORM_PREFIX}_customer_branch_${tenantId}`) || (bList[0]?.id || ''),
          customerSelectedArea: localStorage.getItem(`${PLATFORM_PREFIX}_customer_area_${tenantId}`) || '',
        });

        const inventory = await branchApi.getInventory(tenantId);
        const stockMovements = await branchApi.getStockMovements(tenantId);
        const disabledProducts = await branchApi.getDisabledProducts(tenantId);
        set({ inventory, stockMovements, disabledProducts });
      } catch (e) {
        console.error("Failed to load branch states", e);
      }
    },

    saveBranch: async (branch: Branch) => {
      const tenantId = useTenantStore.getState().activeTenantId;
      const isNew = branch.id.startsWith('branch-');
      let savedBranch: Branch;

      try {
        if (isNew) {
          savedBranch = await branchApi.createBranch(tenantId, branch);
        } else {
          savedBranch = await branchApi.updateBranch(tenantId, branch.id, branch);
        }

        const current = get().branches;
        const index = current.findIndex(b => b.id === branch.id);
        if (index !== -1) {
          current[index] = savedBranch;
        } else {
          current.push(savedBranch);
        }
        set({ branches: [...current] });
      } catch (e) {
        console.error("Failed to save branch", e);
        useUIStore.getState().addToast("Failed to save branch to backend", "error");
      }
    },

    deleteBranch: async (branchId: string) => {
      const tenantId = useTenantStore.getState().activeTenantId;
      try {
        await branchApi.deleteBranch(tenantId, branchId);
        set({ branches: get().branches.filter(b => b.id !== branchId) });
      } catch (e) {
        console.error("Failed to delete branch", e);
      }
    },

    saveInventoryList: (list) => {
      const tenantId = useTenantStore.getState().activeTenantId;
      branchApi.saveInventory(tenantId, list);
      set({ inventory: list });
    },

    addStockMovement: (branchId, itemName, type, qty, reason) => {
      const tenantId = useTenantStore.getState().activeTenantId;
      const movements = [...get().stockMovements];
      const inventory = [...get().inventory];

      const newMovement: StockMovement = {
        id: `move-${branchId}-${Date.now()}`,
        branchId,
        itemName,
        type,
        qty,
        reason,
        timestamp: new Date().toISOString(),
      };
      movements.unshift(newMovement);

      const invItem = inventory.find(i => i.branchId === branchId && i.itemName.toLowerCase() === itemName.toLowerCase());
      if (invItem) {
        if (type === 'in') {
          invItem.qty += qty;
        } else {
          invItem.qty = Math.max(0, invItem.qty - qty);
        }
        invItem.lastUpdated = new Date().toISOString();
      } else {
        inventory.push({
          id: `inv-${branchId}-${Date.now()}`,
          branchId,
          itemName,
          qty: type === 'in' ? qty : 0,
          unit: 'units',
          lastUpdated: new Date().toISOString(),
        });
      }

      branchApi.saveStockMovements(tenantId, movements);
      branchApi.saveInventory(tenantId, inventory);

      set({
        stockMovements: movements,
        inventory,
      });
      useUIStore.getState().addToast(`Stock updated for ${itemName}`, 'success');
    },

    toggleProductBranch: (branchId, itemId) => {
      const tenantId = useTenantStore.getState().activeTenantId;
      const disabled = { ...get().disabledProducts };
      if (!disabled[branchId]) {
        disabled[branchId] = [];
      }

      const index = disabled[branchId].indexOf(itemId);
      if (index === -1) {
        disabled[branchId].push(itemId);
        useUIStore.getState().addToast('Product disabled in this branch', 'info');
      } else {
        disabled[branchId].splice(index, 1);
        useUIStore.getState().addToast('Product enabled in this branch', 'success');
      }

      branchApi.saveDisabledProducts(tenantId, disabled);
      set({ disabledProducts: disabled });
    },
  };
});
