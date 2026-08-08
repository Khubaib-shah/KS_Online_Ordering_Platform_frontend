import { useState, useEffect, useCallback } from 'react';
import { Tenant } from '../types/tenant';
import { PLATFORM_PREFIX } from './constants';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'restaurant-owner' | 'staff';
  restaurantId?: string; // Empty for super-admin
  permissions: any;
  isOwner?: boolean;
  avatarUrl?: string;
  authenticated: boolean;
  assignedBranchId?: string;
  activeShift?: { startTime: string; endTime: string | null } | null;
}

const USER_SESSION_KEY = `${PLATFORM_PREFIX}_current_user`;
const ACTIVE_TENANT_ID_KEY = `${PLATFORM_PREFIX}_active_tenant_id`;

export function mapBackendUserToSession(matchedUser: any): CurrentUser {
  if (matchedUser.globalRole === 'SUPER_ADMIN') {
    return {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: 'super-admin',
      permissions: { orders: 'all', menu: 'manage', reports: 'all', settings: 'manage', staff: 'manage', branches: 'manage', customers: 'all', pos: 'use' },
      isOwner: true,
      avatarUrl: matchedUser.avatarUrl,
      authenticated: true,
    };
  }

  const isOwner = matchedUser.staffProfile?.isOwner || false;
  let perms = {};
  if (isOwner) {
    perms = { orders: 'all', menu: 'manage', reports: 'all', settings: 'manage', staff: 'manage', branches: 'manage', customers: 'all', pos: 'use' };
  } else if (matchedUser.staffProfile?.role?.permissions) {
    perms = matchedUser.staffProfile.role.permissions;
  }

  return {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    role: isOwner ? 'restaurant-owner' : 'staff',
    restaurantId: matchedUser.tenantId,
    permissions: perms,
    isOwner: isOwner,
    avatarUrl: matchedUser.avatarUrl,
    authenticated: true,
    assignedBranchId: matchedUser.staffProfile?.branchId,
    activeShift: matchedUser.activeShift || null,
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
  return !!user && !!user.isOwner;
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

export function getTenantKey(baseKey: string): string {
  const user = getCurrentUser();
  const savedId = localStorage.getItem(ACTIVE_TENANT_ID_KEY) || 'indolj-main';
  const tenantId = getAuthorizedTenantId(user, savedId);

  return `${baseKey}_${tenantId}`;
}

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

  const baseRestaurantPattern = /^\/restaurant\/([^/]+)$/;
  const baseMatch = path.match(baseRestaurantPattern);
  if (baseMatch) {
    return {
      route: '/restaurant/:restaurantId/dashboard',
      params: { restaurantId: baseMatch[1] },
      viewId: 'dashboard',
    };
  }

  return { route: '/login', params: {}, viewId: 'login' };
}

export function checkRoutePermission(
  user: CurrentUser | null,
  routeInfo: RouteInfo,
  tenants: Tenant[]
): { allowed: boolean; redirect?: string } {
  if (!user || !user.authenticated) {
    if (routeInfo.viewId === 'login') {
      return { allowed: true };
    }
    return { allowed: false, redirect: '/login' };
  }

  if (routeInfo.viewId === 'login') {
    if (isSuperAdmin(user)) {
      return { allowed: false, redirect: '/super-admin/dashboard' };
    }
    return { allowed: false, redirect: `/restaurant/${user.restaurantId}/dashboard` };
  }

  if (routeInfo.viewId === 'unauthorized' || routeInfo.viewId === 'suspended') {
    return { allowed: true };
  }

  if (['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'global-areas', 'super-plans', 'create-restaurant'].includes(routeInfo.viewId)) {
    if (isSuperAdmin(user)) {
      return { allowed: true };
    }
    return { allowed: false, redirect: '/unauthorized' };
  }

  const requestedTenantId = routeInfo.params.restaurantId;
  if (requestedTenantId) {
    const tenant = tenants.find((t) => t.id === requestedTenantId);
    
    if (!tenant) {
      return { allowed: false, redirect: '/unauthorized' };
    }

    if (tenant.status === 'suspended' && !isSuperAdmin(user)) {
      return { allowed: false, redirect: '/suspended' };
    }

    if (!canUserAccessTenant(user, requestedTenantId)) {
      return { allowed: false, redirect: '/unauthorized' };
    }

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

    if (user.role === 'super-admin' || user.role === 'restaurant-owner') {
      return { allowed: true };
    }

    const viewRequirements: Record<string, (perms: any) => boolean> = {
      dashboard: (perms) => (perms.reports && perms.reports !== 'none') || (perms.orders && perms.orders !== 'none'),
      orders: (perms) => perms.orders && perms.orders !== 'none',
      pos: (perms) => perms.pos === 'use',
      menu: (perms) => perms.menu && perms.menu !== 'none',
      reports: (perms) => perms.reports && perms.reports !== 'none',
      customers: (perms) => perms.customers && perms.customers !== 'none',
      settings: (perms) => perms.settings && perms.settings !== 'none',
      branches: (perms) => perms.branches && perms.branches !== 'none',
      staff: (perms) => perms.staff && perms.staff !== 'none',
      kitchen: (perms) => perms.orders && perms.orders !== 'none',
      help: () => true,
    };

    const check = viewRequirements[routeInfo.viewId];
    if (check && !check(user.permissions || {})) {
      return { allowed: false, redirect: '/unauthorized' };
    }

    return { allowed: true };
  }

  return { allowed: false, redirect: '/unauthorized' };
}
