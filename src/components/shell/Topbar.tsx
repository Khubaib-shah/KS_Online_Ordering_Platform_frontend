import React from 'react';import { Button } from '@/components/ui/Button';

import { Menu, Shield, ArrowLeft, Lock, Building } from 'lucide-react';
import { AdminUser } from '@/types/user';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useBranchStore } from '@/store/branchStore';
import { useUIStore } from '@/store/uiStore';
import { CurrentUser } from '@/lib/security';
import { isOwnerOrSuper } from '@/lib/security';
import { Select } from '@/components/ui/Select';
import { SearchBar } from '@/components/shell/SearchBar';
import { ProfileMenu } from '@/components/shell/ProfileMenu';
import { MessagesPopover } from '@/components/shell/MessagesPopover';
import { NotificationsPopover } from '@/components/shell/NotificationsPopover';
import { PLATFORM_PREFIX } from '@/lib/constants';

interface TopbarProps {
  user: AdminUser | CurrentUser | null;
}

export function Topbar({ user }: TopbarProps) {
  const { isSuperAdmin, currentUser } = useAuthStore();
  const { activeTenant, detailedTenant, setDetailedTenant } = useTenantStore();
  const { branches, activeBranchFilterId, setBranchFilter } = useBranchStore();
  const { setMobileSidebarOpen, mobileSidebarOpen, activeNavId, setActiveNavId, addToast } = useUIStore();;

  const [storeStatus, setStoreStatus] = React.useState<'open' | 'closed'>(() => {
    return localStorage.getItem(`${PLATFORM_PREFIX}_closed_override`) === 'true' ? 'closed' : 'open';
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      setStoreStatus(localStorage.getItem(`${PLATFORM_PREFIX}_closed_override`) === 'true' ? 'closed' : 'open');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleStoreStatus = () => {
    const nextStatus = storeStatus === 'open' ? 'closed' : 'open';
    setStoreStatus(nextStatus);
    localStorage.setItem(`${PLATFORM_PREFIX}_closed_override`, nextStatus === 'closed' ? 'true' : 'false');
    window.dispatchEvent(new Event('storage'));

    addToast(
      nextStatus === 'open'
        ? 'Store is now active and taking online orders!'
        : 'Store has been set to offline. Customers will see a CLOSED notice.',
      nextStatus === 'open' ? 'success' : 'info'
    );
  };

  const isSuperAdminContext = isSuperAdmin && ['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'super-plans', 'create-restaurant'].includes(activeNavId);
  const isImpersonating = isSuperAdmin && !['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'super-plans', 'create-restaurant'].includes(activeNavId);

  const isTenantContext = !isSuperAdminContext;
  const isOwnerOrSuperVar = isOwnerOrSuper(currentUser);
  const assignedBranchId = currentUser?.assignedBranchId;
  const lockedBranchObj = branches.find(b => b.id === assignedBranchId);

  return (
    <header className="relative h-16 shrink-0 bg-white border border-border-subtle rounded-2xl px-4 flex items-center justify-between shadow-card mb-5 select-none">
      {/* Left side: Mobile Menu Toggle, Impersonation Badge & Search */}
      <div className="flex items-center gap-3 flex-1">
        <Button variant="custom" size="none"           onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="md:hidden w-10 h-10 rounded-full bg-surface-muted hover:bg-surface-hover border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer shrink-0"
          aria-label="Open mobile navigation menu"
        >
          <Menu size={18} />
        </Button>

        {detailedTenant ? (
          <Button variant="custom" size="none"             onClick={() => setDetailedTenant(null)}
            className="flex items-center gap-2 px-3 h-9 text-xs font-semibold text-text-secondary hover:text-text-primary bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary select-none animate-fade-in"
          >
            <ArrowLeft size={13} />
            <span className="font-inter uppercase tracking-wider text-[10px] font-bold text-text-secondary">Back</span>
          </Button>
        ) : isImpersonating && activeTenant ? (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-150 rounded-xl px-3 py-1.5 text-indigo-700 animate-fade-in shrink-0">
            <Shield size={14} className="text-indigo-600 shrink-0" />
            <div className="text-left leading-tight hidden xs:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Viewing Store</p>
              <p className="text-xs font-bold text-indigo-900">{activeTenant.name}</p>
            </div>
            <Button variant="custom" size="none"               onClick={() => setActiveNavId('superadmin')}
              className="ml-2 px-2 py-1 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[9px] font-extrabold uppercase tracking-wider text-indigo-700 transition-all flex items-center gap-0.5 cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowLeft size={10} />
              <span>Back</span>
            </Button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <SearchBar />

            {/* Branch Selector for Owners / Lock badge for Staff */}
            {isTenantContext && branches.length > 0 && (
              <div className="flex items-center gap-2 border-l border-slate-150 pl-3 animate-fade-in">
                {isOwnerOrSuperVar ? (
                  <div className="flex items-center gap-1.5">
                    <Building size={14} className="text-text-muted" />
                    <Select
                      value={activeBranchFilterId}
                      onChange={(e) => setBranchFilter(e.target.value)}
                      className="h-9 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
                    >
                      <option value="all">All Branches</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.area})
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-text-secondary px-2.5 py-1.5 rounded-xl text-xs font-bold">
                    <Lock size={12} className="text-text-muted shrink-0" />
                    <span>Outlet: {lockedBranchObj?.name || 'Assigned Branch'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side: Action icons & User profile */}
      <div className="flex items-center gap-3 md:gap-3.5">
        {/* Compact Operating Hours Toggle Button */}
        <Button variant="custom" size="none"           onClick={toggleStoreStatus}
          className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 sm:gap-2 font-inter text-[11px] font-bold transition-all shadow-2xs select-none cursor-pointer ${storeStatus === 'open'
            ? 'bg-emerald-50 border-emerald-200/60 text-[#0E4B3E] hover:bg-emerald-100/60'
            : 'bg-rose-50 border-rose-200/60 text-rose-600 hover:bg-rose-100/60'
            }`}
          title="Toggle store operating hours"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${storeStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="hidden xs:inline uppercase tracking-wider">{storeStatus === 'open' ? 'ONLINE (OPEN)' : 'OFFLINE (CLOSED)'}</span>
          <span className="xs:hidden uppercase tracking-wider">{storeStatus === 'open' ? 'OPEN' : 'CLOSED'}</span>
        </Button>

        <MessagesPopover />

        <NotificationsPopover />

        <div className="h-7 w-px bg-border-subtle" />

        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
