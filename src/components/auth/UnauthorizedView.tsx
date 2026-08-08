import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePathname, isSuperAdmin } from '@/lib/security';
import { PLATFORM_NAME } from '@/config/platform';

export function UnauthorizedView() {
  const { currentUser, logout } = useAuthStore();
  const [, navigate] = usePathname();

  const handleGoHome = () => {
    if (!currentUser) {
      window.location.href = '/login';
    } else if (isSuperAdmin(currentUser)) {
      window.location.href = '/super-admin/dashboard';
    } else {
      window.location.href = `/restaurant/${currentUser.restaurantId}/dashboard`;
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans select-none text-center">
      <div className="w-full max-w-md bg-white border border-border-subtle rounded-3xl p-8 shadow-card space-y-6">

        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
          <ShieldAlert size={32} className="animate-bounce" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
            Access Restricted
          </h1>
          <p className="text-sm font-semibold text-text-secondary leading-relaxed">
            You do not have administrative permission to view this section, or the page belongs to a different restaurant tenant.
          </p>
        </div>

        {/* User Context Details */}
        {currentUser && (
          <div className="bg-slate-50 border border-border-subtle rounded-2xl p-4 text-left text-xs font-semibold text-text-secondary space-y-1">
            <p>Logged in as: <span className="text-text-primary font-bold">{currentUser.name}</span></p>
            <p>Role: <span className="text-[#0E4B3E] font-bold uppercase tracking-wider">{currentUser.role}</span></p>
            {currentUser.restaurantId && (
              <p>Tenant ID: <span className="text-slate-800 font-mono font-bold">{currentUser.restaurantId}</span></p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleGoHome}
            className="w-full py-3 bg-[#0E4B3E] hover:bg-[#0A342B] text-white rounded-2xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Go to My Dashboard</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 hover:bg-slate-100 text-text-secondary hover:text-text-primary rounded-2xl font-bold text-xs tracking-wide transition-all border border-border-subtle flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out of Account</span>
          </button>
        </div>

      </div>
      <div className="mt-8 text-[10px] text-text-secondary font-medium tracking-wide">
        {PLATFORM_NAME} Authorization Security Core
      </div>
    </div>
  );
}
