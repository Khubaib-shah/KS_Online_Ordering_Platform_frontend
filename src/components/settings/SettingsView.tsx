import { useState } from 'react'; import { Button } from '@/components/ui/Button';

import { useSettings } from '@/hooks/useSettings';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useUIStore } from '@/store/uiStore';
import { isSuperAdmin } from '@/lib/security';
import {
  User,
  Globe,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { AccountTab } from '@/components/settings/tabs/AccountTab';
import { BusinessTab } from '@/components/settings/tabs/BusinessTab';
import { BillingTab } from '@/components/settings/tabs/BillingTab';
import { IntegrationsTab } from '@/components/settings/tabs/IntegrationsTab';
import { OperationsTab } from '@/components/settings/tabs/OperationsTab';
import { HardwareTab } from '@/components/settings/tabs/hardware/HardwareTab';
import { Printer } from 'lucide-react';

export function SettingsView() {
  const { currentUser, updateCurrentUserProfile } = useAuthStore();
  const { activeTenant, saveTenant } = useTenantStore();
  const { addToast } = useUIStore();;
  const { settings, isLoading, saveSettings, refetch } = useSettings();

  // Primary Sub-Tab navigation state: 'account' | 'business' | 'operations' | 'hardware' | 'billing' | 'integrations'
  const [activeTab, setActiveTab] = useState<'account' | 'business' | 'operations' | 'hardware' | 'billing' | 'integrations'>('account');

  if (isLoading || !settings) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 animate-fade-in" id="settings-loader">
        <div className="w-11 h-11 rounded-full border-4 border-accent-primary/10 border-t-accent-primary animate-spin mb-3" />
        <span className="text-xs font-semibold text-text-secondary">Loading configurations...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full select-none animate-fade-in pb-12 text-left font-sans" id="settings-view-root">

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-6 md:mb-8">
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary tracking-tight leading-[1.2]">
            Settings & Branding
          </h1>
          <p className="text-[15px] sm:text-base text-text-secondary mt-1 leading-[1.5]">
            Update your store info, branding, subscription, and integrations.
          </p>
        </div>
      </div>

      {/* Main Multi-Tab Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-5 md:gap-6 items-start">

        {/* Left Side Sub-Tab Selectors (Horizontal scroll on mobile, side menu on desktop) */}
        <div className="w-full lg:w-64 bg-white border border-border-subtle/40 rounded-card shadow-card p-2 sm:p-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 shrink-0 no-scrollbar whitespace-nowrap">
          {[
            { id: 'account', icon: User, label: 'Profile' },
            { id: 'business', icon: Globe, label: 'Store & Brand' },
            { id: 'operations', icon: Briefcase, label: 'Operations' },
            { id: 'hardware', icon: Printer, label: 'Hardware & POS' },
            { id: 'billing', icon: Briefcase, label: 'Subscription' },
            ...(isSuperAdmin(currentUser) ? [{ id: 'integrations', icon: CreditCard, label: 'Integrations' }] : []),
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="custom"
              size="none"
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-bold rounded-xl transition-all text-left cursor-pointer shrink-0
                focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 outline-none
                ${activeTab === tab.id ? 'bg-accent-tint-bg text-accent-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'}
              `}
              id={`tab-${tab.id}`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-accent-primary' : 'text-text-secondary/60'} />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Right Side Form Panel */}
        <div className="flex-1 w-full bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-4 sm:p-6.5 min-h-[480px]">
          {activeTab === 'account' && (
            <AccountTab
              currentUser={currentUser}
              updateCurrentUserProfile={updateCurrentUserProfile}
              addToast={addToast}
            />
          )}

          {activeTab === 'business' && (
            <BusinessTab
              settings={settings}
              activeTenant={activeTenant}
              saveSettings={saveSettings}
              saveTenant={saveTenant}
              refetch={refetch}
              addToast={addToast}
            />
          )}

          { activeTab === 'operations' && (
            <OperationsTab
              settings={settings}
              activeTenant={activeTenant}
              saveSettings={saveSettings}
              refetch={refetch}
              addToast={addToast}
            />
          )}

          {activeTab === 'hardware' && (
            <HardwareTab addToast={addToast} />
          )}

          {activeTab === 'billing' && (
            <BillingTab
              activeTenant={activeTenant}
              saveTenant={saveTenant}
              addToast={addToast}
            />
          )}

          {activeTab === 'integrations' && isSuperAdmin(currentUser) && (
            <IntegrationsTab
              settings={settings}
              saveSettings={saveSettings}
              refetch={refetch}
              addToast={addToast}
            />
          )}
        </div>

      </div>

    </div>
  );
}
