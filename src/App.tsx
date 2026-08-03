import React, { useEffect, Suspense } from 'react';
import { AppShell } from './components/shell/AppShell';
import { useAuthStore } from './store/authStore';
import { useTenantStore } from './store/tenantStore';
import { useUIStore } from './store/uiStore';
import { CommandPalette } from './components/shell/CommandPalette';
import { usePathname, parsePath, checkRoutePermission } from './lib/security';
import { updateRootTheme } from './lib/theme';
import { LoadingView, SpinnerLoading } from './components/ui/LoadingView';

// Lazy load views for perfect role-based and module-based bundle splitting
const DashboardView = React.lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const OrdersView = React.lazy(() => import('./components/orders/OrdersView').then(m => ({ default: m.OrdersView })));
const KitchenView = React.lazy(() => import('./components/orders/KitchenView').then(m => ({ default: m.KitchenView })));
const MenuView = React.lazy(() => import('./components/menu/MenuView').then(m => ({ default: m.MenuView })));
const ReportsView = React.lazy(() => import('./components/reports/ReportsView').then(m => ({ default: m.ReportsView })));
const CustomersView = React.lazy(() => import('./components/customers/CustomersView').then(m => ({ default: m.CustomersView })));
const POSView = React.lazy(() => import('./components/pos/POSView').then(m => ({ default: m.POSView })));
const SettingsView = React.lazy(() => import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView })));
const PlaceholderView = React.lazy(() => import('./components/dashboard/PlaceholderView').then(m => ({ default: m.PlaceholderView })));
const HelpView = React.lazy(() => import('./components/help/HelpView').then(m => ({ default: m.HelpView })));
const LoginView = React.lazy(() => import('./components/auth/LoginView').then(m => ({ default: m.LoginView })));
const SuperAdminView = React.lazy(() => import('./components/superadmin/SuperAdminView').then(m => ({ default: m.SuperAdminView })));
const SuperReportsView = React.lazy(() => import('./components/superadmin/SuperReportsView').then(m => ({ default: m.SuperReportsView })));
const SuperEscalationsView = React.lazy(() => import('./components/superadmin/SuperEscalationsView').then(m => ({ default: m.SuperEscalationsView })));
const SuperClusterView = React.lazy(() => import('./components/superadmin/SuperClusterView').then(m => ({ default: m.SuperClusterView })));
const GlobalAreasView = React.lazy(() => import('./components/superadmin/GlobalAreasView').then(m => ({ default: m.GlobalAreasView })));
const SuperPlansView = React.lazy(() => import('./components/superadmin/SuperPlansView').then(m => ({ default: m.SuperPlansView })));
const CreateRestaurantPage = React.lazy(() => import('./components/superadmin/CreateRestaurantPage').then(m => ({ default: m.CreateRestaurantPage })));
const RestaurantsListView = React.lazy(() => import('./components/superadmin/RestaurantsListView').then(m => ({ default: m.RestaurantsListView })));
const UnauthorizedView = React.lazy(() => import('./components/auth/UnauthorizedView').then(m => ({ default: m.UnauthorizedView })));
const SuspendedView = React.lazy(() => import('./components/auth/SuspendedView').then(m => ({ default: m.SuspendedView })));
const BranchesView = React.lazy(() => import('./components/branches/BranchesView').then(m => ({ default: m.BranchesView })));

import { useGlobalPWA } from './hooks/usePWAInstall';

export default function App() {
  const [pathname, navigate] = usePathname();
  
  const { isLoggedIn, currentUser, initAuth } = useAuthStore();
  const { activeTenant, activeTenantId, setActiveTenantId, tenants, fetchTenants } = useTenantStore();
  const { activeNavId, setActiveNavId } = useUIStore();
  
  useGlobalPWA();

  // Load tenants on mount and initialize auth
  useEffect(() => {
    initAuth();
    fetchTenants();
    const handleUnauthorized = () => {
      useAuthStore.getState().logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [fetchTenants, initAuth]);

  // Parse path and execute route/permission guards
  const routeInfo = parsePath(pathname);

  useEffect(() => {
    // 1. Check permissions
    const guard = checkRoutePermission(currentUser, routeInfo, tenants);
    if (!guard.allowed && guard.redirect) {
      navigate(guard.redirect);
      return;
    }

    // 2. Synchronize active navigation element (such as activeNavId in Zustand store)
    if (routeInfo.viewId && routeInfo.viewId !== activeNavId) {
      setActiveNavId(routeInfo.viewId);
    }

    // 3. Synchronize tenant context if route has a restaurant ID
    const routeTenantId = routeInfo.params.restaurantId;
    if (routeTenantId && routeTenantId !== activeTenantId) {
      setActiveTenantId(routeTenantId);
    }
  }, [
    pathname,
    currentUser?.id,
    currentUser?.role,
    currentUser?.restaurantId,
    currentUser?.authenticated,
    routeInfo.viewId,
    routeInfo.params.restaurantId,
    activeNavId,
    activeTenantId,
    tenants.length,
    setActiveNavId,
    setActiveTenantId,
    navigate
  ]);

  // Apply visual theme branding of the active restaurant/tenant
  useEffect(() => {
    const isSuperAdminContext = ['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'global-areas', 'super-plans', 'create-restaurant'].includes(routeInfo.viewId) || ['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'global-areas', 'super-plans', 'create-restaurant'].includes(activeNavId);
    updateRootTheme(activeTenant, isSuperAdminContext);
  }, [activeTenant, activeNavId, routeInfo.viewId]);

  // Renders the matched main view component
  const renderView = () => {
    switch (activeNavId) {
      case 'superadmin':
        return <SuperAdminView />;
      case 'restaurants-list':
        return <RestaurantsListView />;
      case 'create-restaurant':
        return <CreateRestaurantPage />;
      case 'super-reports':
        return <SuperReportsView />;
      case 'super-escalations':
        return <SuperEscalationsView />;
      case 'super-cluster':
        return <SuperClusterView />;
      case 'global-areas':
        return <GlobalAreasView />;
      case 'super-plans':
        return <SuperPlansView />;
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'pos':
        return <POSView />;
      case 'kitchen':
        return <KitchenView />;
      case 'menu':
        return <MenuView />;
      case 'branches':
        return <BranchesView />;

      case 'reports':
        return <ReportsView />;
      case 'customers':
        return <CustomersView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpView />;
      case 'logout':
        return (
          <PlaceholderView
            title="Logout Session"
            description="You have clicked the session logout. All parameters are secured."
            iconName="LogOut"
          />
        );
      default:
        return <DashboardView />;
    }
  };

  // Rendering root layouts depending on major security categories (Login, Unauthorized, Suspended)
  if (routeInfo.viewId === 'login') {
    return (
      <Suspense fallback={<SpinnerLoading />}>
        <LoginView />
      </Suspense>
    );
  }

  if (routeInfo.viewId === 'unauthorized') {
    return (
      <Suspense fallback={<SpinnerLoading />}>
        <UnauthorizedView />
      </Suspense>
    );
  }

  if (routeInfo.viewId === 'suspended') {
    return (
      <Suspense fallback={<SpinnerLoading />}>
        <SuspendedView />
      </Suspense>
    );
  }

  // If session is unauthenticated, let route guards do redirect, show login fallback meanwhile
  if (!isLoggedIn || !currentUser) {
    return (
      <Suspense fallback={<SpinnerLoading />}>
        <LoginView />
      </Suspense>
    );
  }

  return (
    <>
      <AppShell user={currentUser}>
        <Suspense fallback={<LoadingView />}>
          {renderView()}
        </Suspense>
      </AppShell>
      <CommandPalette />
    </>
  );
}
