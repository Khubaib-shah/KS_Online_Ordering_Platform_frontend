import { create } from 'zustand';
import { useTenantStore } from './tenantStore';
import { useAuthStore } from './authStore';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UIState {
  sidebarCollapsed: boolean;
  activeNavId: string;
  mobileSidebarOpen: boolean;
  toasts: ToastMessage[];
  openAddItemTrigger: boolean;
  openAddCategoryTrigger: boolean;
  openAddPromoTrigger: boolean;
  menuActiveTab: 'items' | 'categories' | 'promos';
  commandPaletteOpen: boolean;
  dashboardDateFilter: 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'current-shift' | 'previous-shift';

  setDashboardDateFilter: (filter: 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'current-shift' | 'previous-shift') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveNavId: (id: string) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setOpenAddItemTrigger: (open: boolean) => void;
  setOpenAddCategoryTrigger: (open: boolean) => void;
  setOpenAddPromoTrigger: (open: boolean) => void;
  setMenuActiveTab: (tab: 'items' | 'categories' | 'promos') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', action?: { label: string; onClick: () => void }) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => {
  return {
    sidebarCollapsed: false,
    activeNavId: 'dashboard',
    mobileSidebarOpen: false,
    toasts: [],
    openAddItemTrigger: false,
    openAddCategoryTrigger: false,
    openAddPromoTrigger: false,
    menuActiveTab: 'items',
    commandPaletteOpen: false,
    dashboardDateFilter: 'today',

    setDashboardDateFilter: (filter) => {
      set({ dashboardDateFilter: filter });
      get().addToast(`Date filter set to ${filter}`, 'info');
    },

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    setActiveNavId: (id) => {
      if (id === 'logout') {
        useAuthStore.getState().logout();
        return;
      }
      set({ activeNavId: id });

      if (typeof window !== 'undefined') {
        const tenantId = useTenantStore.getState().activeTenantId || 'indolj-main';
        const superAdminViews = [
          'superadmin',
          'restaurants-list',
          'create-restaurant',
          'super-reports',
          'super-escalations',
          'super-cluster',
          'super-plans'
        ];

        let targetPath = `/restaurant/${tenantId}/${id}`;
        if (superAdminViews.includes(id)) {
          if (id === 'superadmin') targetPath = '/super-admin/dashboard';
          else if (id === 'restaurants-list') targetPath = '/super-admin/restaurants';
          else if (id === 'create-restaurant') targetPath = '/restaurants/create';
          else targetPath = `/super-admin/${id.replace('super-', '')}`;
        }

        if (window.location.pathname !== targetPath) {
          window.history.pushState(null, '', targetPath);
          window.dispatchEvent(new Event('popstate'));
        }
      }
    },
    setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
    setOpenAddItemTrigger: (open) => set({ openAddItemTrigger: open }),
    setOpenAddCategoryTrigger: (open) => set({ openAddCategoryTrigger: open }),
    setOpenAddPromoTrigger: (open) => set({ openAddPromoTrigger: open }),
    setMenuActiveTab: (tab) => set({ menuActiveTab: tab }),
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

    addToast: (message, type = 'info', action) => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { id, message, type, action }],
      }));

      // Auto-remove after 4 seconds
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 4000);
    },

    removeToast: (id) => set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    })),
  };
});
