import React, { useEffect } from 'react';import { Button } from '@/components/ui/Button';

import { motion, AnimatePresence } from 'motion/react';
import { Utensils, X, LayoutGrid, ShoppingBag, UtensilsCrossed, BarChart3, Users, Settings, HelpCircle, LogOut, Shield, Building2, Calculator } from 'lucide-react';
import { AdminUser } from '@/types/user';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useUIStore } from '@/store/uiStore';
import { CurrentUser } from '@/lib/security';
import { isOwnerOrSuper } from '@/lib/security';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useOrders } from '@/hooks/useOrders';

interface AppShellProps {
  children: React.ReactNode;
  user: AdminUser | CurrentUser | null;
}

export function AppShell({ children, user }: AppShellProps) {
  const { isSuperAdmin, logout } = useAuthStore();
  const { activeTenantId, activeTenant } = useTenantStore();
  const { mobileSidebarOpen, setMobileSidebarOpen, activeNavId, toasts, removeToast } = useUIStore();;

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { orders } = useOrders();
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  // Close mobile drawer if screen size increases to desktop
  useEffect(() => {
    if (isDesktop && mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [isDesktop, mobileSidebarOpen, setMobileSidebarOpen]);

  const isSuperAdminContext = isSuperAdmin && ['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'super-plans', 'create-restaurant'].includes(activeNavId);

  // If a branch is selected, wait for branches to load if the user is owner/super admin
  // (Staff are locked to their assigned branch)
  const canManageBranches = isOwnerOrSuper(user as CurrentUser) || user?.role === 'manager';

  const mobileMenuItems = isSuperAdminContext
    ? [
      { id: 'superadmin', icon: Shield, label: 'Admin Dashboard' },
      { id: 'restaurants-list', icon: Building2, label: 'Stores List' },
      { id: 'super-reports', icon: BarChart3, label: 'Stores Reports' },
      { id: 'super-cluster', icon: Shield, label: 'System Status' },
      { id: 'super-plans', icon: Shield, label: 'Packages' },
      { id: 'super-escalations', icon: HelpCircle, label: 'Support' },
      { id: 'logout', icon: LogOut, label: 'Logout' },
    ]
    : [
      ...(isSuperAdmin ? [{ id: 'superadmin', icon: Shield, label: 'Admin Dashboard' }] : []),
      { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
      { id: 'orders', icon: ShoppingBag, label: 'Orders', badge: pendingCount > 0 ? String(pendingCount) : undefined },
      { id: 'pos', icon: Calculator, label: 'POS' },
      { id: 'menu', icon: UtensilsCrossed, label: 'Menu' },
      ...(canManageBranches ? [{ id: 'branches', icon: Building2, label: 'Branches' }] : []),
      { id: 'reports', icon: BarChart3, label: 'Reports' },
      { id: 'customers', icon: Users, label: 'Customers' },
      { id: 'settings', icon: Settings, label: 'Settings' },
      { id: 'help', icon: HelpCircle, label: 'Help' },
      { id: 'logout', icon: LogOut, label: 'Logout' },
    ];

  const handleNavClick = (id: string) => {
    setMobileSidebarOpen(false);
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
    } else if (id === 'super-plans') {
      window.history.pushState(null, '', '/super-admin/plans');
      window.dispatchEvent(new Event('popstate'));
    } else {
      window.history.pushState(null, '', `/restaurant/${activeTenantId}/${id}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const isImpersonating = isSuperAdmin && !['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'global-areas', 'super-plans', 'create-restaurant'].includes(activeNavId);
  const activeTenantName = activeTenant ? activeTenant.name : 'Shop / Store';

  return (
    <div className="h-screen w-screen bg-canvas-bg flex flex-col overflow-hidden">
      {/* Impersonation Banner */}
      <AnimatePresence>
        {isImpersonating && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 40, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#7C3AED] text-white flex items-center justify-between px-6 shrink-0 text-xs font-semibold z-[9999] select-none shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="animate-pulse">⚡</span>
              <span>You are viewing as <strong className="font-extrabold">{activeTenantName}</strong></span>
            </div>
            <Button variant="custom" size="none"               onClick={() => handleNavClick('superadmin')}
              className="bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-full border border-white/20 transition-all cursor-pointer text-[10px] uppercase font-bold"
            >
              Close Store View ×
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered Floating Container */}
      <div className="flex-1 w-full h-full bg-white shadow-shell border border-border-subtle flex overflow-hidden relative">

        {/* Desktop Sidebar (blends into container, white background) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 bg-white">
          <Topbar user={user} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden pr-0.5 pb-2">
            {children}
          </main>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />

              {/* Sidebar Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-64 bg-white border-r border-border-subtle z-50 p-5 flex flex-col gap-6 select-none md:hidden"
              >
                {/* Header of Mobile Drawer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent-primary flex items-center justify-center text-white shrink-0">
                      <Utensils size={18} />
                    </div>
                    <span className="font-poppins font-bold text-lg tracking-tight text-text-primary">Indolj</span>
                  </div>
                  <Button variant="custom" size="none"                     onClick={() => setMobileSidebarOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-surface-hover border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    <X size={16} />
                  </Button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
                  {mobileMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNavId === item.id;
                    return (
                      <Button variant="custom" size="none"                         key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full h-11 px-4 rounded-xl flex items-center gap-3.5 transition-colors cursor-pointer text-sm font-medium font-inter ${isActive
                          ? 'bg-accent-tint-bg text-accent-primary font-semibold border-l-4 border-accent-primary'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                          }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-accent-dark text-white rounded-full text-[10px] font-semibold h-5 px-2 flex items-center justify-center animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </nav>

                {/* Footer of Mobile Drawer */}
                <div className="border-t border-border-subtle pt-4 text-center">
                  <span className="text-[10px] font-semibold text-text-secondary/50 font-inter tracking-wider">
                    INDOLJ PLATFORM ADMIN
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Global Floating Toast Notifications */}
        <div className="absolute bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none select-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`
                  pointer-events-auto flex items-center justify-between gap-4.5 px-4.5 py-3 rounded-2xl shadow-card border text-sm font-medium font-inter
                  ${toast.type === 'success'
                    ? 'bg-[#16A34A]/5 border-[#16A34A]/25 text-[#16A34A]'
                    : toast.type === 'error'
                      ? 'bg-[#DC2626]/5 border-[#DC2626]/25 text-[#DC2626]'
                      : 'bg-accent-tint-bg border-accent-primary/20 text-accent-primary'
                  }
                `}
              >
                <span>{toast.message}</span>
                <Button variant="custom" size="none"                   onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                >
                  <X size={14} />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
