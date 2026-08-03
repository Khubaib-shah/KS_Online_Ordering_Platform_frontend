import { useState, useMemo } from 'react';import { Button } from '@/components/ui/Button';

import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  Users,
  ShieldCheck,
  Check,
  Sliders,
  TrendingUp,
  Utensils
} from 'lucide-react';

import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useTenantStore } from '@/store/tenantStore';
import { useUIStore } from '@/store/uiStore';
import { Tenant } from '@/types/tenant';
import { DataTable } from '@/components/data-table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { StatCard } from '@/components/dashboard/StatCard';
import { SimplePageHeader } from '@/components/dashboard/SimplePageHeader';

interface PlanConfig {
  id: 'starter' | 'premium' | 'enterprise';
  name: string;
  price: number;
  maxOrdersPerDay: number;
  maxMenuItems: number;
  features: string[];
  color: string;
  badge?: string;
}

const INITIAL_PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter Plan (Small Restaurant)',
    price: 15000,
    maxOrdersPerDay: 150,
    maxMenuItems: 30,
    features: [
      'Single Branch Portal',
      'Standard Interactive Dashboard',
      'Basic Theme Customization (Accent Colors)',
      'Shared Core Cloud DB Instance',
      'Standard Support Email SLA'
    ],
    color: 'amber'
  },
  {
    id: 'premium',
    name: 'Premium Plan (Standalone Large)',
    price: 35000,
    maxOrdersPerDay: 1000,
    maxMenuItems: 150,
    features: [
      'Single Branch Dedicated Space',
      'Interactive Bento Analytics & Reports',
      'Complete Branding & Custom Colors Config',
      'CSV Excel Report Audits Stream',
      'Slack Core Webhook Trigger integrations',
      'Priority Support SLA (24h Response)'
    ],
    color: 'emerald',
    badge: 'Most Popular'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan (Multi-Branch Chain)',
    price: 75000,
    maxOrdersPerDay: 99999,
    maxMenuItems: 99999,
    features: [
      'Multi-Branch Master Sync Network',
      'Custom White-Label Portal Domain Binding',
      'Unlimited orders & unlimited catalog menu items',
      'Advanced Super Ledger Auditor Sheets',
      'Custom Dedicated DB Read Replica Proxy',
      '24/7 Phone & Dedicated Support Representative'
    ],
    color: 'indigo'
  }
];

export function SuperPlansView() {
  const { tenants, saveTenant } = useTenantStore();
  const { addToast } = useUIStore();;
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);

  // Edit Plan Pricing Form State
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editOrders, setEditOrders] = useState<number>(0);
  const [editMenuItems, setEditMenuItems] = useState<number>(0);

  const handleEditPlanClick = (plan: PlanConfig) => {
    setEditingPlan(plan);
    setEditPrice(plan.price);
    setEditOrders(plan.maxOrdersPerDay);
    setEditMenuItems(plan.maxMenuItems);
  };

  const handleSavePlanDetails = () => {
    if (!editingPlan) return;

    setPlans(prev => prev.map(p => p.id === editingPlan.id ? {
      ...p,
      price: editPrice,
      maxOrdersPerDay: editOrders,
      maxMenuItems: editMenuItems
    } : p));

    addToast(`Plan limits for ${editingPlan.name} updated successfully!`, 'success');
    setEditingPlan(null);
  };

  const handleTenantPlanChange = (tenant: Tenant, newPlan: 'starter' | 'premium' | 'enterprise') => {
    const updated: Tenant = {
      ...tenant,
      subscriptionPlan: newPlan
    };
    saveTenant(updated);
    addToast(`Successfully changed ${tenant.name} subscription plan to ${newPlan.toUpperCase()}!`, 'success');
  };

  const columns = useMemo<ColumnDef<Tenant>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Restaurant Store',
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: tenant.brandColor }}
            >
              <Utensils size={14} />
            </div>
            <span className="font-bold text-slate-900">{tenant.name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'slug',
      header: 'Store Website',
      cell: ({ row }) => (
        <span className="font-mono text-slate-500 text-[11px]">/{row.original.slug}</span>
      )
    },
    {
      accessorKey: 'adminEmail',
      header: 'Store Contact',
      cell: ({ row }) => (
        <span className="font-mono text-slate-600">{row.original.adminEmail}</span>
      )
    },
    {
      accessorKey: 'subscriptionPlan',
      header: 'Subscription Plan',
      cell: ({ row }) => {
        const activePlanId = row.original.subscriptionPlan || 'premium';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${activePlanId === 'starter' ? 'bg-[#FEF3C7] text-[#92400E]' :
            activePlanId === 'enterprise' ? 'bg-[#EEF2FF] text-[#3730A3] border border-indigo-100' :
              'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
            {activePlanId}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-right pr-2">Change Store Plan</div>,
      cell: ({ row }) => {
        const tenant = row.original;
        const activePlanId = tenant.subscriptionPlan || 'premium';
        return (
          <div className="text-right pr-2">
            <Select
              value={activePlanId}
              onChange={(e) => handleTenantPlanChange(tenant, e.target.value as any)}
              className="h-8 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer shadow-xs"
            >
              <option value="starter">Starter Plan (Small)</option>
              <option value="premium">Premium Plan (Standalone)</option>
              <option value="enterprise">Enterprise Plan (Multi-Branch)</option>
            </Select>
          </div>
        );
      }
    }
  ], [tenants]);

  return (
    <div className="space-y-6 w-full px-4 md:px-6 py-2 text-left font-sans animate-fade-in">

      {/* Top Header Panel replaced with SimplePageHeader */}
      <SimplePageHeader
        title="Subscription Plans"
        description="Configure pricing plans, adjust store features, set order limits, and upgrade active restaurant stores."
        categoryTag="Subscription Plans"
        icon={Coins}
        statusBadge={{
          text: "Billing system updated",
          pulseColor: "bg-emerald-500"
        }}
      />

      {/* Subscription Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
        <StatCard
          data={{
            id: 'monthly-sales',
            title: 'Monthly Sales (Cashflow)',
            value: 'Rs. 425,000',
            format: 'currency',
            trend: { direction: 'up', percent: 14.2, label: 'Annual revenue growth' },
            variant: 'white'
          }}
          actionIcon={<Coins size={16} />}
        />

        <StatCard
          data={{
            id: 'plan-subscribers',
            title: 'Plan Subscribers',
            value: `${tenants.length} stores`,
            format: 'number',
            trend: { direction: 'up', percent: 100, label: `${tenants.filter(t => t.status === 'active').length} active stores` },
            variant: 'white'
          }}
          actionIcon={<Users size={16} />}
        />

        <StatCard
          data={{
            id: 'renewal-rate',
            title: 'Renewal Rate',
            value: '100.0%',
            format: 'percent',
            trend: { direction: 'up', percent: 100, label: 'Excellent store loyalty' },
            variant: 'white'
          }}
          actionIcon={<ShieldCheck size={16} />}
        />

        <StatCard
          data={{
            id: 'cancellation-rate',
            title: 'Store Cancellation Rate',
            value: '0.0%',
            format: 'percent',
            trend: { direction: 'down', percent: 0, label: 'No stores canceled' },
            variant: 'white'
          }}
          actionIcon={<TrendingUp size={16} />}
        />
      </div>

      {/* Subscription Tier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        {plans.map((plan) => {
          const tenantCount = tenants.filter(t => (t.subscriptionPlan || 'premium') === plan.id).length;

          return (
            <div
              key={plan.id}
              className={`relative border rounded-[2rem] p-6 flex flex-col justify-between bg-white shadow-xs transition-all duration-300 hover:shadow-card hover:-translate-y-1 ${plan.badge ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200/70'
                }`}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 right-6 px-3.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white bg-indigo-600 rounded-full shadow-sm animate-pulse">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                {/* Plan Header */}
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full w-max block ${plan.color === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    plan.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-indigo-50 text-indigo-700 border border-indigo-150'
                    }`}>
                    {plan.id} plan
                  </span>
                  <h3 className="font-poppins font-extrabold text-slate-900 text-lg">{plan.name}</h3>
                  <span className="text-[11px] font-semibold text-slate-400 block">{tenantCount} active stores assigned</span>
                </div>

                {/* Plan Price */}
                <div className="py-2.5 border-y border-slate-100 flex items-baseline gap-1">
                  <span className="text-2xl font-bold md:font-black text-slate-900">Rs. {plan.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-xs font-semibold">/ month</span>
                </div>

                {/* Core Parameters list */}
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Max Orders Per Day</span>
                    <span className="font-mono text-slate-800 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {plan.maxOrdersPerDay === 99999 ? 'Unlimited' : `${plan.maxOrdersPerDay} orders`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Max Menu Items</span>
                    <span className="font-mono text-slate-800 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {plan.maxMenuItems === 99999 ? 'Unlimited' : `${plan.maxMenuItems} dishes`}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Plan Features</span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 leading-snug">
                      <Check size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit CTA */}
              <Button variant="custom" size="none"                 onClick={() => handleEditPlanClick(plan)}
                className="w-full h-11 border border-slate-200/60 hover:border-indigo-600 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all mt-6 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-xs"
              >
                <Sliders size={13} />
                <span>Change Plan Limits</span>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Adjust Plan Limit Modal */}
      <AnimatePresence>
        {editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-xl text-left space-y-5"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-600 block">Plan Limits Manager</span>
                <h3 className="font-poppins font-extrabold text-slate-900 text-lg">Adjust limits: {editingPlan.name}</h3>
                <p className="text-slate-400 text-xs">These changes will apply immediately to all stores on this plan.</p>
              </div>

              <div className="space-y-4">
                {/* 1. Monthly subscription price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">Monthly Price (Rs.)</label>
                  <Input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                  />
                </div>

                {/* 2. Daily orders limit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">Max Orders per Day</label>
                  <Input
                    type="number"
                    value={editOrders}
                    onChange={(e) => setEditOrders(Number(e.target.value))}

                    disabled={editOrders === 99999}
                  />
                  {editOrders === 99999 && (
                    <span className="text-[10px] text-slate-400 font-semibold block">Enterprise has unlimited daily orders.</span>
                  )}
                </div>

                {/* 3. Catalog menu items limit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">Max Menu Items Limit</label>
                  <Input
                    type="number"
                    value={editMenuItems}
                    onChange={(e) => setEditMenuItems(Number(e.target.value))}

                    disabled={editMenuItems === 99999}
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button variant="custom" size="none"                   onClick={() => setEditingPlan(null)}
                  className="flex-1 h-11 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button variant="custom" size="none"                   onClick={handleSavePlanDetails}
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tenants Plan Assignment Audit Sheet */}
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={tenants}
          emptyMessage="No restaurant stores found."
        />
      </div>

    </div>
  );
}
