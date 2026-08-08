import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useUIStore } from '@/store/uiStore';
import { isOwnerOrSuper } from '@/lib/security';
import { SidebarNavItem } from '@/components/shell/SidebarNavItem';
import { SidebarSectionLabel } from '@/components/shell/SidebarSectionLabel';
import { SidebarPromoCard } from '@/components/shell/SidebarPromoCard';
import { cn } from '@/lib/cn';
import { useOrders } from '@/hooks/useOrders';
import { supportApi } from '@/lib/api/support.api';
import { Utensils, ChevronLeft, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const { isSuperAdmin: isSuper, logout, currentUser } = useAuthStore();
  const { activeTenantId, activeTenant } = useTenantStore();
  const { sidebarCollapsed, activeNavId, setSidebarCollapsed } = useUIStore();

  const { orders, meta } = useOrders();
  const pendingCount = (meta as any)?.statusCounts?.pending || orders.filter((o: any) => o.status === 'PENDING').length;

  const [openTicketsCount, setOpenTicketsCount] = useState(0);

  useEffect(() => {
    if (isSuper) {
      try {
        const tickets = supportApi.getTickets();
        const count = tickets.filter(t => t.status === 'open').length;
        setOpenTicketsCount(count);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isSuper, activeNavId]);

  const isSuperAdminContext = isSuper && ['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'global-areas', 'super-plans', 'create-restaurant'].includes(activeNavId);

  const canManageBranches = isOwnerOrSuper(currentUser) || (currentUser?.permissions?.branches && currentUser.permissions.branches !== 'none');

  // centralize feature flag checker helper
  const isFeatureEnabled = (key: keyof import('@/types/tenant').FeatureFlags) => {
    return activeTenant?.config?.features?.[key] !== false;
  };

  const menuItems = isSuperAdminContext
    ? [
      { id: 'superadmin', icon: 'Shield' as const, label: 'Admin Dashboard' },
      { id: 'restaurants-list', icon: 'Building2' as const, label: 'Stores List' },
      { id: 'super-reports', icon: 'BarChart3' as const, label: 'Stores Reports' },
      { id: 'super-cluster', icon: 'Activity' as const, label: 'System Status' },
      { id: 'global-areas', icon: 'Map' as const, label: 'Delivery Areas' },
      { id: 'super-plans', icon: 'Sliders' as const, label: 'Packages' },
      { id: 'super-escalations', icon: 'HelpCircle' as const, label: 'Support', badge: openTicketsCount > 0 ? String(openTicketsCount) : undefined },
    ]
    : [
      ...(isSuper ? [{ id: 'superadmin', icon: 'Shield' as const, label: 'Super Admin' }] : []),
      { id: 'dashboard', icon: 'LayoutGrid' as const, label: 'Dashboard' },
      { id: 'orders', icon: 'ShoppingBag' as const, label: 'Orders', badge: pendingCount > 0 ? String(pendingCount) : undefined },
      ...(isFeatureEnabled('pos') ? [{ id: 'pos', icon: 'Calculator' as const, label: 'POS' }] : []),
      ...(isFeatureEnabled('kitchen') ? [{ id: 'kitchen', icon: 'UtensilsCrossed' as const, label: 'Kitchen' }] : []),
      { id: 'menu', icon: 'UtensilsCrossed' as const, label: 'Menu' },
      ...(canManageBranches && isFeatureEnabled('staff') ? [{ id: 'branches', icon: 'Building2' as const, label: 'Branches' }] : []),
      ...(isFeatureEnabled('reports') ? [{ id: 'reports', icon: 'BarChart3' as const, label: 'Reports' }] : []),
      ...(isFeatureEnabled('membership') ? [{ id: 'customers', icon: 'Users' as const, label: 'Customers' }] : []),
    ];

  const generalItems = isSuperAdminContext
    ? [
      { id: 'logout', icon: 'LogOut' as const, label: 'Logout' },
    ]
    : [
      { id: 'settings', icon: 'Settings' as const, label: 'Settings' },
      { id: 'help', icon: 'HelpCircle' as const, label: 'Help' },
      { id: 'logout', icon: 'LogOut' as const, label: 'Logout' },
    ];

  const handleNavClick = (id: string) => {
    if (id === 'logout') {
      logout();
    } else if (id === 'superadmin') {
      window.history.pushState(null, '', '/super-admin/dashboard');
      window.dispatchEvent(new Event('popstate'));
    } else if (id === 'restaurants-list') {
      window.history.pushState(null, '', '/super-admin/restaurants');
      window.dispatchEvent(new Event('popstate'));
    } else if (id === 'super-reports') {
      window.history.pushState(null, '', '/super-admin/reports');
      window.dispatchEvent(new Event('popstate'));
    } else if (id === 'super-escalations') {
      window.history.pushState(null, '', '/super-admin/escalations');
      window.dispatchEvent(new Event('popstate'));
    } else if (id === 'super-cluster') {
      window.history.pushState(null, '', '/super-admin/cluster');
      window.dispatchEvent(new Event('popstate'));
    } else if (id === 'global-areas') {
      window.history.pushState(null, '', '/super-admin/global-areas');
      window.dispatchEvent(new Event('popstate'));
    } else if (id === 'super-plans') {
      window.history.pushState(null, '', '/super-admin/plans');
      window.dispatchEvent(new Event('popstate'));
    } else {
      window.history.pushState(null, '', `/restaurant/${activeTenantId}/${id}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const displayName = isSuperAdminContext ? 'Super Admin' : (activeTenant?.name || 'Indolj');

  return (
    <div
      className="hidden md:flex flex-col h-full bg-white shrink-0 border-r border-border-subtle py-5 px-2 select-none transition-all duration-300 relative"
      style={{ width: sidebarCollapsed ? '78px' : '230px' }}
    >
      {/* Collapse toggle button */}
      <Button variant="custom" size="none" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3.5 top-22 w-7 h-7 bg-white rounded-full border border-border-subtle shadow-button flex items-center justify-center hover:bg-surface-hover text-text-secondary hover:text-text-primary cursor-pointer z-20"
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      {/* Fixed Logo Section */}
      <div className={cn("flex items-center gap-3 h-11 shrink-0 select-none mb-6", sidebarCollapsed ? "px-1 justify-center" : "px-3")}>
        {activeTenant?.logoUrl && !isSuperAdminContext ? (
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-button overflow-hidden border border-border-subtle/50">
            <img src={activeTenant.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white shrink-0 shadow-button">
            <Utensils size={20} className="animate-pulse" />
          </div>
        )}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-poppins font-bold text-lg tracking-tight text-text-primary whitespace-nowrap overflow-hidden"
              title={displayName}
            >
              {displayName.length > 14 ? displayName.substring(0, 12) + '..' : displayName}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable Container (contains nav links + the promo/help card) */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar gap-6">
        <div className="flex flex-col gap-6">
          {/* Menu Section */}
          <nav className={cn("flex flex-col gap-1", sidebarCollapsed ? "px-0" : "px-2")}>
            {!sidebarCollapsed && <SidebarSectionLabel label="Menu" />}
            {menuItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                id={item.id}
                icon={item.icon}
                label={item.label}
                active={activeNavId === item.id}
                collapsed={sidebarCollapsed}
                badge={item.badge}
                onClick={() => handleNavClick(item.id)}
              />
            ))}

            {!sidebarCollapsed && <SidebarSectionLabel label="General" />}
            {generalItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                id={item.id}
                icon={item.icon}
                label={item.label}
                active={activeNavId === item.id}
                collapsed={sidebarCollapsed}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </nav>
        </div>

        {/* Promo/Help Card is at the bottom of the scrollable container */}
        {!sidebarCollapsed && !isSuperAdminContext && (
          <div className="shrink-0 mt-auto pt-2">
            <SidebarPromoCard />
          </div>
        )}
      </div>
    </div>
  );
}
