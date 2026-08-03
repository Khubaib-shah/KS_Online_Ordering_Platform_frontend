import { Octagon, LogOut, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { PLATFORM_NAME } from '@/config/platform';


export function SuspendedView() {
  const { logout } = useAuthStore();
  const { activeTenant } = useTenantStore();;

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-amber-50/30 p-6 font-sans select-none text-center">
      <div className="w-full max-w-md bg-white border border-amber-200 rounded-3xl p-8 shadow-card space-y-6">

        {/* Suspended Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
          <Octagon size={32} className="animate-pulse" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
            Account Paused
          </h1>
          <p className="text-sm font-semibold text-text-secondary leading-relaxed">
            The subscription for <span className="text-amber-700 font-extrabold font-poppins">{activeTenant?.name || 'this restaurant'}</span> is currently paused by the system administrator.
          </p>
        </div>

        {/* Informative Help Box */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-left text-xs font-semibold text-amber-800 space-y-2">
          <p className="font-bold uppercase tracking-wider text-[10px] text-amber-900">What does this mean?</p>
          <p className="leading-relaxed text-amber-900/80">
            You cannot see your menus, orders, or reports until the account plan is updated or activated by an administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              window.open('mailto:support@indolj.com?subject=Suspended%20Tenant%20Reactivation');
            }}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>Contact System Support</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 hover:bg-slate-50 text-text-secondary hover:text-text-primary rounded-2xl font-bold text-xs tracking-wide transition-all border border-border-subtle flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>

      </div>
      <div className="mt-8 text-[10px] text-text-secondary font-medium tracking-wide">
        {PLATFORM_NAME} Security System
      </div>
    </div>
  );
}
