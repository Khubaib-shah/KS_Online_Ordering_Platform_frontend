import { useState, useEffect, useCallback } from 'react';
import { Tenant } from '../types/tenant';
import { PLATFORM_PREFIX } from './constants';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'restaurant-owner' | 'manager' | 'cashier' | 'kitchen';
  restaurantId?: string; // Empty for super-admin
  permissions: string[]; // Legacy
  permissionOrders: 'NONE' | 'READ' | 'MANAGE';
  permissionMenu: 'NONE' | 'READ' | 'MANAGE';
  permissionReports: 'NONE' | 'READ' | 'MANAGE';
  permissionSettings: 'NONE' | 'READ' | 'MANAGE';
  avatarUrl?: string;
  authenticated: boolean;
  assignedBranchId?: string;
}

const USER_SESSION_KEY = `${PLATFORM_PREFIX}_current_user`;
const ACTIVE_TENANT_ID_KEY = `${PLATFORM_PREFIX}_active_tenant_id`;

export function mapBackendUserToSession(matchedUser: any): CurrentUser {
  return {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.globalRole === 'SUPER_ADMIN' ? 'super-admin' : 
          (matchedUser.staffProfile?.designation === 'OWNER' ? 'restaurant-owner' : 
          (matchedUser.staffProfile?.designation === 'KITCHEN_STAFF' ? 'kitchen' : 
          (matchedUser.staffProfile?.designation === 'CASHIER' ? 'cashier' : 'manager'))),
    restaurantId: matchedUser.tenantId,
    permissions: [],
    permissionOrders: matchedUser.globalRole === 'SUPER_ADMIN' ? 'MANAGE' : (matchedUser.staffProfile?.permissionOrders || 'NONE'),
    permissionMenu: matchedUser.globalRole === 'SUPER_ADMIN' ? 'MANAGE' : (matchedUser.staffProfile?.permissionMenu || 'NONE'),
    permissionReports: matchedUser.globalRole === 'SUPER_ADMIN' ? 'MANAGE' : (matchedUser.staffProfile?.permissionReports || 'NONE'),
    permissionSettings: matchedUser.globalRole === 'SUPER_ADMIN' ? 'MANAGE' : (matchedUser.staffProfile?.permissionSettings || 'NONE'),
    avatarUrl: matchedUser.avatarUrl,
    authenticated: true,
    assignedBranchId: matchedUser.staffProfile?.branchId
  };
}



export function getCurrentUser(): CurrentUser | null {
  const data = localStorage.getItem(USER_SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as CurrentUser;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: CurrentUser | null) {
  if (user) {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_SESSION_KEY);
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_SESSION_KEY);
}

export function isSuperAdmin(user: CurrentUser | null): boolean {
  return !!user && user.role === 'super-admin';
}

export function isOwner(user: CurrentUser | null): boolean {
  return !!user && user.role === 'restaurant-owner';
}

export function isOwnerOrSuper(user: CurrentUser | null): boolean {
  return isSuperAdmin(user) || isOwner(user);
}

// Global utility to check if a user is authorized to access a specific tenant
export function canUserAccessTenant(user: CurrentUser | null, targetTenantId: string): boolean {
  if (!user) return true;
  if (isSuperAdmin(user)) return true;
  return user.restaurantId === targetTenantId;
}

// Global utility to get the enforced tenant ID for a user
export function getAuthorizedTenantId(user: CurrentUser | null, requestedOrSavedTenantId: string): string {
  if (user && !isSuperAdmin(user) && user.restaurantId) {
    return user.restaurantId;
  }
  return requestedOrSavedTenantId;
}

// SECURE TENANT KEY PREFIXING
// This secures all storage access from being leaked or cross-accessed.
// Even if the client-side activeTenantId in local storage is mutated,
// non-super-admins are strictly locked to their session restaurantId.
export function getTenantKey(baseKey: string): string {
  const user = getCurrentUser();
  const savedId = localStorage.getItem(ACTIVE_TENANT_ID_KEY) || 'indolj-main';
  const tenantId = getAuthorizedTenantId(user, savedId);

  return `${baseKey}_${tenantId}`;
}

// Light-weight reactive custom browser router
export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path);
    setPathname(path);
    window.dispatchEvent(new Event('popstate'));
  }, []);

  return [pathname, navigate] as const;
}

export interface RouteInfo {
  route: string;
  params: Record<string, string>;
  viewId: string;
}

export function parsePath(pathname: string): RouteInfo {
  const path = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  if (path === '/login' || path === '' || path === '/') {
    return { route: '/login', params: {}, viewId: 'login' };
  }
  if (path === '/unauthorized') {
    return { route: '/unauthorized', params: {}, viewId: 'unauthorized' };
  }
  if (path === '/suspended') {
    return { route: '/suspended', params: {}, viewId: 'suspended' };
  }
  if (path === '/super-admin' || path === '/super-admin/dashboard') {
    return { route: '/super-admin/dashboard', params: {}, viewId: 'superadmin' };
  }
  if (path === '/super-admin/restaurants' || path === '/restaurants') {
    return { route: '/super-admin/restaurants', params: {}, viewId: 'restaurants-list' };
  }
  if (path === '/super-admin/reports') {
    return { route: '/super-admin/reports', params: {}, viewId: 'super-reports' };
  }
  if (path === '/super-admin/escalations') {
    return { route: '/super-admin/escalations', params: {}, viewId: 'super-escalations' };
  }
  if (path === '/super-admin/cluster') {
    return { route: '/super-admin/cluster', params: {}, viewId: 'super-cluster' };
  }
  if (path === '/super-admin/global-areas') {
    return { route: '/super-admin/global-areas', params: {}, viewId: 'global-areas' };
  }
  if (path === '/super-admin/plans') {
    return { route: '/super-admin/plans', params: {}, viewId: 'super-plans' };
  }
  if (path === '/restaurants/create' || path === '/super-admin/restaurants/create') {
    return { route: '/restaurants/create', params: {}, viewId: 'create-restaurant' };
  }

  // Check pattern: /restaurant/:restaurantId/:view
  const restaurantPattern = /^\/restaurant\/([^/]+)\/([^/]+)$/;
  const match = path.match(restaurantPattern);
  if (match) {
    const restaurantId = match[1];
    const view = match[2];
    return {
      route: `/restaurant/:restaurantId/${view}`,
      params: { restaurantId },
      viewId: view,
    };
  }

  // Check pattern: /restaurant/:restaurantId
  const baseRestaurantPattern = /^\/restaurant\/([^/]+)$/;
  const baseMatch = path.match(baseRestaurantPattern);
  if (baseMatch) {
    return {
      route: '/restaurant/:restaurantId/dashboard',
      params: { restaurantId: baseMatch[1] },
      viewId: 'dashboard',
    };
  }

  // Fallback
  return { route: '/login', params: {}, viewId: 'login' };
}

// ROUTE PROTECTION & ROLE GUARD LOGIC
export function checkRoutePermission(
  user: CurrentUser | null,
  routeInfo: RouteInfo,
  tenants: Tenant[]
): { allowed: boolean; redirect?: string } {
  // 1. Unauthenticated checking
  if (!user || !user.authenticated) {
    if (routeInfo.viewId === 'login') {
      return { allowed: true };
    }
    return { allowed: false, redirect: '/login' };
  }

  // 2. Authenticated user accessing login page -> redirect to their default home
  if (routeInfo.viewId === 'login') {
    if (isSuperAdmin(user)) {
      return { allowed: false, redirect: '/super-admin/dashboard' };
    }
    return { allowed: false, redirect: `/restaurant/${user.restaurantId}/dashboard` };
  }

  // 3. Unauthorized and suspended views are universally accessible when authenticated
  if (routeInfo.viewId === 'unauthorized' || routeInfo.viewId === 'suspended') {
    return { allowed: true };
  }

  // 4. Super Admin routes protection
  if (['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'global-areas', 'super-plans', 'create-restaurant'].includes(routeInfo.viewId)) {
    if (isSuperAdmin(user)) {
      return { allowed: true };
    }
    return { allowed: false, redirect: '/unauthorized' };
  }

  // 5. Tenant routes protection
  const requestedTenantId = routeInfo.params.restaurantId;
  if (requestedTenantId) {
    const tenant = tenants.find((t) => t.id === requestedTenantId);
    
    // Check if tenant exists
    if (!tenant) {
      return { allowed: false, redirect: '/unauthorized' };
    }

    // Check if tenant is suspended (super admins bypass suspension for dashboard review)
    if (tenant.status === 'suspended' && !isSuperAdmin(user)) {
      return { allowed: false, redirect: '/suspended' };
    }

    // Isolate tenant access: non-super-admins cannot access other restaurants
    if (!canUserAccessTenant(user, requestedTenantId)) {
      return { allowed: false, redirect: '/unauthorized' };
    }

    // Central feature flag protection
    if (tenant.config?.features) {
      const feat = tenant.config.features;
      if (routeInfo.viewId === 'pos' && !feat.pos) {
        return { allowed: false, redirect: '/unauthorized' };
      }
      if (routeInfo.viewId === 'kitchen' && !feat.kitchen) {
        return { allowed: false, redirect: '/unauthorized' };
      }
      if (routeInfo.viewId === 'reports' && !feat.reports) {
        return { allowed: false, redirect: '/unauthorized' };
      }
      if (routeInfo.viewId === 'website' && !feat.onlineOrdering) {
        return { allowed: false, redirect: '/unauthorized' };
      }
      if (routeInfo.viewId === 'branches' && !feat.staff) {
        return { allowed: false, redirect: '/unauthorized' };
      }
      if (routeInfo.viewId === 'customers' && !feat.membership) {
        return { allowed: false, redirect: '/unauthorized' };
      }
    }

    // Verify view permissions
    const viewPermissions: Record<string, string[]> = {
      dashboard: ['super-admin', 'restaurant-owner', 'manager', 'cashier'],
      orders: ['super-admin', 'restaurant-owner', 'manager', 'cashier'],
      pos: ['super-admin', 'restaurant-owner', 'manager', 'cashier'],
      menu: ['super-admin', 'restaurant-owner', 'manager'],
      reports: ['super-admin', 'restaurant-owner', 'manager'],
      customers: ['super-admin', 'restaurant-owner', 'manager', 'cashier'],
      settings: ['super-admin', 'restaurant-owner'],
      kitchen: ['super-admin', 'restaurant-owner', 'manager', 'kitchen'],
      help: ['super-admin', 'restaurant-owner', 'manager', 'cashier', 'kitchen'],
    };

    const allowedRoles = viewPermissions[routeInfo.viewId] || ['super-admin', 'restaurant-owner'];
    if (!allowedRoles.includes(user.role)) {
      return { allowed: false, redirect: '/unauthorized' };
    }

    return { allowed: true };
  }

  // Fallback to unauthorized if view doesn't match and not handled
  return { allowed: false, redirect: '/unauthorized' };
}
