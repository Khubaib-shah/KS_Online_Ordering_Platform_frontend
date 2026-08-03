import { Select } from '../../ui/Select';import { Button } from '@/components/ui/Button';

import React from 'react';
import { Input } from '../../ui/Input';
import { Sparkles, Check, TrendingUp, FileText } from 'lucide-react';

interface BillingTabProps {
  activeTenant: any;
  saveTenant: (tenant: any) => any;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function BillingTab({ activeTenant, saveTenant, addToast }: BillingTabProps) {
  
  const handleUpgradePlan = async (plan: 'starter' | 'premium' | 'enterprise') => {
    if (!activeTenant) return;
    try {
      await saveTenant({
        ...activeTenant,
        subscriptionPlan: plan
      });
      addToast(`SaaS cluster subscription updated to ${plan.toUpperCase()}`, 'success');
    } catch (err) {
      addToast('Failed to modify subscription', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6.5 animate-fade-in text-left" id="form-billing">
      <div className="border-b border-border-subtle/10 pb-3">
        <h3 className="font-sans font-extrabold text-base text-text-primary">
          SaaS Cluster Subscription & Invoicing
        </h3>
        <p className="text-xs text-text-secondary">Verify active system nodes, billing history, and scale operational resources.</p>
      </div>

      {/* Sub-section 1: Current plan overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border-subtle bg-slate-50 relative overflow-hidden flex flex-col justify-between h-36">
          <div>
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Active Tier</span>
            <span className="text-lg font-bold md:font-black text-slate-900 mt-1 block capitalize">
              {activeTenant?.subscriptionPlan || 'premium'} Plan
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-700 font-extrabold uppercase">Live Cluster Node</span>
          </div>
          <Sparkles size={64} className="absolute -right-4 -bottom-4 text-slate-200/50 shrink-0 pointer-events-none" />
        </div>

        <div className="p-4 rounded-2xl border border-border-subtle bg-slate-50 flex flex-col justify-between h-36">
          <div>
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Billing Frequency</span>
            <span className="text-lg font-bold md:font-black text-slate-900 mt-1 block">Monthly Invoice</span>
          </div>
          <div className="text-[10px] text-text-secondary font-semibold">
            Next renewal: <span className="font-bold text-slate-950">August 04, 2026</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border-subtle bg-slate-50 flex flex-col justify-between h-36">
          <div>
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Estimated Price</span>
            <span className="text-lg font-bold md:font-black text-accent-primary mt-1 block">
              {activeTenant?.subscriptionPlan === 'starter' ? 'Rs. 2,500' : activeTenant?.subscriptionPlan === 'enterprise' ? 'Rs. 18,500' : 'Rs. 8,500'} <span className="text-xs font-semibold text-text-secondary">/mo</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-green-700 font-bold bg-green-50 border border-green-100/50 px-2 py-0.5 rounded-md w-fit">
            <Check size={11} />
            <span>Auto-Paid</span>
          </div>
        </div>
      </div>

      {/* Sub-section 2: Pricing tiers comparison to switch */}
      <div className="space-y-4 pt-4 border-t border-border-subtle/10">
        <h4 className="text-[11px] font-extrabold uppercase text-accent-primary pb-1 flex items-center gap-1">
          <TrendingUp size={13} />
          <span>Comparison Matrix & Scaling Options</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starter Tier */}
          <div className={`p-4.5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative ${
            activeTenant?.subscriptionPlan === 'starter' 
              ? 'border-accent-primary bg-accent-tint-bg/20 shadow-sm' 
              : 'border-border-subtle bg-white hover:bg-slate-50'
          }`}>
            {activeTenant?.subscriptionPlan === 'starter' && (
              <span className="absolute right-3.5 top-3.5 text-[8px] font-bold uppercase text-accent-primary bg-accent-tint-bg border border-accent-primary/20 px-2 py-0.5 rounded-md">Current</span>
            )}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-900 block">Starter Core</span>
              <p className="text-[10px] text-text-secondary leading-normal font-semibold">Perfect for small kiosks, food trucks, or quick test catalogs.</p>
              <span className="text-base font-bold text-slate-900 block">Rs. 2,500 <span className="text-[10px] text-text-secondary font-semibold">/mo</span></span>
            </div>
            <ul className="text-[10px] text-text-secondary/90 font-semibold space-y-1.5 border-t border-border-subtle/10 pt-3 flex-1">
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> Max 50 Menu Items</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> Basic Table QR Sheets</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> 1 Operational Admin Node</li>
            </ul>
            <Button variant="custom" size="none"               type="button"
              disabled={activeTenant?.subscriptionPlan === 'starter'}
              onClick={() => handleUpgradePlan('starter')}
              className="w-full h-8 text-[10px] font-extrabold text-center rounded-lg border border-border-subtle bg-white hover:bg-slate-50 text-text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {activeTenant?.subscriptionPlan === 'starter' ? 'Active' : 'Downgrade to Starter'}
            </Button>
          </div>

          {/* Premium Tier */}
          <div className={`p-4.5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative ${
            activeTenant?.subscriptionPlan === 'premium' || !activeTenant?.subscriptionPlan
              ? 'border-accent-primary bg-accent-tint-bg/20 shadow-sm' 
              : 'border-border-subtle bg-white hover:bg-slate-50'
          }`}>
            {activeTenant?.subscriptionPlan === 'premium' && (
              <span className="absolute right-3.5 top-3.5 text-[8px] font-bold uppercase text-accent-primary bg-accent-tint-bg border border-accent-primary/20 px-2 py-0.5 rounded-md">Current</span>
            )}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 block">Premium Suite</span>
                <span className="text-[8px] font-bold uppercase bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Popular</span>
              </div>
              <p className="text-[10px] text-text-secondary leading-normal font-semibold">Standard dine-in and online ordering joints with live Kanban kitchen grids.</p>
              <span className="text-base font-bold text-slate-900 block">Rs. 8,500 <span className="text-[10px] text-text-secondary font-semibold">/mo</span></span>
            </div>
            <ul className="text-[10px] text-text-secondary/90 font-semibold space-y-1.5 border-t border-border-subtle/10 pt-3 flex-1">
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> Unlimited Menu Items</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> Live Kanban Kitchen Boards</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> Reservation Management sheets</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> 5 Custom Staff roles</li>
            </ul>
            <Button variant="custom" size="none"               type="button"
              disabled={activeTenant?.subscriptionPlan === 'premium' || !activeTenant?.subscriptionPlan}
              onClick={() => handleUpgradePlan('premium')}
              className="w-full h-8 text-[10px] font-extrabold text-center rounded-lg bg-accent-primary hover:bg-accent-dark text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {activeTenant?.subscriptionPlan === 'premium' ? 'Active Suite' : 'Upgrade to Premium'}
            </Button>
          </div>

          {/* Enterprise Tier */}
          <div className={`p-4.5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative ${
            activeTenant?.subscriptionPlan === 'enterprise' 
              ? 'border-accent-primary bg-accent-tint-bg/20 shadow-sm' 
              : 'border-border-subtle bg-white hover:bg-slate-50'
          }`}>
            {activeTenant?.subscriptionPlan === 'enterprise' && (
              <span className="absolute right-3.5 top-3.5 text-[8px] font-bold uppercase text-accent-primary bg-accent-tint-bg border border-accent-primary/20 px-2 py-0.5 rounded-md">Current</span>
            )}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-900 block">Enterprise Cluster</span>
              <p className="text-[10px] text-text-secondary leading-normal font-semibold">Multi-outlet franchises demanding dedicated service SLAs, cluster reports, and API pipelines.</p>
              <span className="text-base font-bold text-slate-900 block">Rs. 18,500 <span className="text-[10px] text-text-secondary font-semibold">/mo</span></span>
            </div>
            <ul className="text-[10px] text-text-secondary/90 font-semibold space-y-1.5 border-t border-border-subtle/10 pt-3 flex-1">
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> Dedicated Cluster VM Hosting</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> 24/7 Telephone SLA Helpline</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> Deep Analytics & CSV Logs exports</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-accent-primary" /> Unlimited Staff Nodes</li>
            </ul>
            <Button variant="custom" size="none"               type="button"
              disabled={activeTenant?.subscriptionPlan === 'enterprise'}
              onClick={() => handleUpgradePlan('enterprise')}
              className="w-full h-8 text-[10px] font-extrabold text-center rounded-lg border border-border-subtle bg-white hover:bg-slate-50 text-text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {activeTenant?.subscriptionPlan === 'enterprise' ? 'Active Cluster' : 'Upgrade to Enterprise'}
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-section 3: Simulated invoices */}
      <div className="space-y-3 pt-4 border-t border-border-subtle/10">
        <h4 className="text-[11px] font-extrabold uppercase text-accent-primary flex items-center gap-1">
          <FileText size={13} />
          <span>Recent Billing & Cluster Invoices</span>
        </h4>

        <div className="bg-slate-50 border border-border-subtle rounded-xl p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold p-2 bg-white rounded-lg border border-border-subtle/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-accent-tint-bg text-accent-primary flex items-center justify-center font-bold text-[10px]">PDF</div>
              <div>
                <span className="font-bold text-slate-900 block">Invoice #GH-2026-06</span>
                <span className="text-[9px] text-text-secondary">Issued: June 04, 2026</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 text-[11px]">Rs. 8,500</span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-green-50 text-green-700 border border-green-100">Paid</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold p-2 bg-white rounded-lg border border-border-subtle/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-accent-tint-bg text-accent-primary flex items-center justify-center font-bold text-[10px]">PDF</div>
              <div>
                <span className="font-bold text-slate-900 block">Invoice #GH-2026-05</span>
                <span className="text-[9px] text-text-secondary">Issued: May 04, 2026</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 text-[11px]">Rs. 8,500</span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-green-50 text-green-700 border border-green-100">Paid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
