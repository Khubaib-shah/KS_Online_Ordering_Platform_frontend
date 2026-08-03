import { create } from 'zustand';
import { CurrentUser, getCurrentUser, setCurrentUser, clearCurrentUser, mapBackendUserToSession, isSuperAdmin } from '@/lib/security';
import { useTenantStore } from '@/store/tenantStore';
import { useBranchStore } from '@/store/branchStore';
import { useUIStore } from '@/store/uiStore';
import { PLATFORM_PREFIX } from '@/lib/constants';

interface AuthState {
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  currentUser: CurrentUser | null;
  loginWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  updateCurrentUserProfile: (profile: Partial<CurrentUser>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialUser = getCurrentUser();
  const isLoggedInVal = !!(initialUser && initialUser.authenticated);
  const isSuperAdminVal = isSuperAdmin(initialUser);

  return {
    isLoggedIn: isLoggedInVal,
    isSuperAdmin: isSuperAdminVal,
    currentUser: initialUser,

    loginWithCredentials: async (email, pass) => {
      try {
        const { apiClient } = await import('../lib/api-client');
        const res = (await apiClient.post('/auth/login', { email, password: pass })) as any;

        if (!res.user) {
          return { success: false, message: 'Invalid response from server' };
        }

        const matchedUser = res.user;
        const sessionUser = mapBackendUserToSession(matchedUser);

        if (res.token) {
          localStorage.setItem(`${PLATFORM_PREFIX}_access_token`, res.token);
        }

        setCurrentUser(sessionUser);

        const targetTenantId = matchedUser.tenantId || 'indolj-main';
        localStorage.setItem(`${PLATFORM_PREFIX}_active_tenant_id`, targetTenantId);

        // Dynamic access to tenant store to avoid direct circular hooks
        const tenantStore = useTenantStore.getState();
        if (tenantStore.tenants.length === 0) {
          await tenantStore.fetchTenants();
        }


        tenantStore.setActiveTenantId(targetTenantId);

        set({
          isLoggedIn: true,
          isSuperAdmin: isSuperAdmin(sessionUser),
          currentUser: sessionUser,
        });

        // Set activeNavId in uiStore depending on role
        useUIStore.getState().setActiveNavId(isSuperAdmin(sessionUser) ? 'superadmin' : 'dashboard');

        // Trigger branch loading
        useBranchStore.getState().loadTenantBranches();

        useUIStore.getState().addToast(`Logged in as ${sessionUser.name}`, 'success');
        return { success: true };
      } catch (err: any) {
        const errMsg = err.error || err.message || (err.code === 'UNAUTHORIZED' ? 'Invalid email or password' : 'Login failed');
        return { success: false, message: errMsg };
      }
    },

    logout: async () => {
      try {
        const { apiClient } = await import('../lib/api-client');
        await apiClient.post('/auth/logout');
      } catch {
        // Ignore logout errors on network level
      }
      clearCurrentUser();
      localStorage.removeItem(`${PLATFORM_PREFIX}_active_tenant_id`);

      set({
        isLoggedIn: false,
        isSuperAdmin: false,
        currentUser: null,
      });

      // Clear tenant state
      const tenantStore = useTenantStore.getState();

      tenantStore.setActiveTenantId('indolj-main');

      useUIStore.getState().setActiveNavId('dashboard');
      useUIStore.getState().addToast('Successfully logged out', 'info');

      window.history.pushState(null, '', '/login');
      window.dispatchEvent(new Event('popstate'));
    },

    initAuth: async () => {
      try {
        const { apiClient } = await import('../lib/api-client');
        const res = (await apiClient.get('/auth/me')) as any;
        if (res && res.id) {
          const matchedUser = res;
          const sessionUser = mapBackendUserToSession(matchedUser);
          setCurrentUser(sessionUser);
          set({
            isLoggedIn: true,
            isSuperAdmin: isSuperAdmin(sessionUser),
            currentUser: sessionUser,
          });
          useBranchStore.getState().loadTenantBranches();
        }
      } catch (err) {
        clearCurrentUser();
        set({
          isLoggedIn: false,
          isSuperAdmin: false,
          currentUser: null,
        });
      }
    },

    updateCurrentUserProfile: (profile) => {
      const current = get().currentUser;
      if (!current) return;
      const updated = { ...current, ...profile };
      setCurrentUser(updated);
      set({ currentUser: updated });
    },
  };
});
