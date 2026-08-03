
import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Palette,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  Eye,
  UserCheck,
  Ban,
  Utensils,
  ShoppingBag,
  ArrowUpRight,
  Layers,
  Network,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useUIStore } from '@/store/uiStore';
import { tenantsApi } from '@/lib/api/tenants.api';
import { Tenant } from '@/types/tenant';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { motion, AnimatePresence } from 'motion/react';
import { StatCard } from '@/components/dashboard/StatCard';
import { SimplePageHeader } from '@/components/dashboard/SimplePageHeader';
import { usePathname } from '@/lib/security';
import { RestaurantDetailView } from '@/components/superadmin/RestaurantDetailView';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export function SuperAdminView() {
  const [, navigate] = usePathname();
  const { logout } = useAuthStore();
  const { tenants, setActiveTenantId, saveTenant, deleteTenant, detailedTenant, setDetailedTenant } = useTenantStore();
  const { addToast } = useUIStore();;

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);

  const [platformStats, setPlatformStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await tenantsApi.getSuperAdminStats();
      if (stats) setPlatformStats(stats);
    };
    fetchStats();
  }, []);

  const columns = useMemo<ColumnDef<Tenant>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Restaurant / Slug Name',
        cell: ({ row }) => {
          const tenant = row.original;
          return (
            <div className="flex items-center gap-3.5 select-none">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm relative transition-transform hover:scale-105 animate-fade-in"
                style={{ backgroundColor: tenant.brandColor }}
              >
                <Utensils size={18} />
                <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center bg-slate-900 text-[8px] font-bold text-white">
                  {tenant.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{tenant.name}</p>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
                  /{tenant.slug}
                </span>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'subscriptionPlan',
        header: 'Plan / Scale Type',
        cell: ({ row }) => {
          const plan = row.original.subscriptionPlan || 'premium';
          return (
            <div className="select-none">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${plan === 'starter'
                ? 'bg-[#FEF3C7] text-[#92400E]'
                : plan === 'enterprise'
                  ? 'bg-[#EEF2FF] text-[#3730A3] border border-indigo-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                {plan}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 block mt-1">
                {plan === 'starter' ? 'Small Restaurant' : plan === 'enterprise' ? 'Multi-Branch chain' : 'Large Standalone'}
              </span>
            </div>
          );
        }
      },
      {
        id: 'branding',
        header: 'Branding Preset',
        cell: ({ row }) => {
          const tenant = row.original;
          return (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1 w-max select-none">
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-200 block shadow-xs"
                style={{ backgroundColor: tenant.brandColor }}
                title={`Primary: ${tenant.brandColor}`}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-200 block shadow-xs"
                style={{ backgroundColor: tenant.darkColor }}
                title={`Dark: ${tenant.darkColor}`}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-200 block shadow-xs"
                style={{ backgroundColor: tenant.lightColor }}
                title={`Light: ${tenant.lightColor}`}
              />
            </div>
          );
        }
      },
      {
        accessorKey: 'adminEmail',
        header: 'Admin Coordinates',
        cell: ({ row }) => {
          const email = row.original.adminEmail;
          return (
            <div className="space-y-0.5 select-none">
              <span className="font-mono text-slate-800 text-xs block">{email}</span>
              <span className="text-[9px] font-semibold text-slate-400 block">Root Administrator</span>
            </div>
          );
        }
      },
      {
        accessorKey: 'adminPassword',
        header: 'Access Password',
        cell: ({ row }) => {
          return (
            <span className="font-mono text-slate-600 font-bold select-none">
              {row.original.adminPassword || 'admin'}
            </span>
          );
        }
      },
      {
        accessorKey: 'status',
        header: 'Node Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider select-none ${status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
              {status}
            </span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const tenant = row.original;
          return (
            <div className="flex items-center justify-end gap-2 no-row-click select-none">
              {/* View Detailed Dashboard Analytics */}
              <Button variant="custom" size="none" onClick={() => setDetailedTenant(tenant)}
                title="View Operations & Live Analytics"
                className="w-8.5 h-8.5 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-accent-primary border border-slate-200/60 shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
              >
                <Eye size={14} />
              </Button>

              {/* Copy Access Pack */}
              <Button variant="custom" size="none" onClick={() => handleCopyCredentials(tenant)}
                title="Copy Access Credentials Pack"
                className="w-8.5 h-8.5 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-emerald-600 border border-slate-200/60 shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
              >
                {copiedTenantId === tenant.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </Button>

              {/* Edit Details */}
              <Button variant="custom" size="none" onClick={() => handleEditClick(tenant)}
                title="Edit White-Label Branding Parameters"
                className="w-8.5 h-8.5 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 border border-slate-200/60 shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
              >
                <Palette size={14} />
              </Button>

              {/* Suspend/Activate */}
              <Button variant="custom" size="none" onClick={() => handleToggleSuspend(tenant)}
                title={tenant.status === 'active' ? 'Temporarily Suspend Access' : 'Re-activate Node Access'}
                className={`w-8.5 h-8.5 rounded-full bg-white hover:bg-amber-50 text-slate-500 border border-slate-200/60 hover:border-amber-200/60 flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 ${tenant.status === 'active'
                  ? 'hover:text-amber-600'
                  : 'hover:text-emerald-600'
                  }`}
              >
                {tenant.status === 'active' ? <Ban size={14} /> : <UserCheck size={14} />}
              </Button>

              {/* Delete */}
              <Button variant="custom" size="none" onClick={() => {
                if (confirm(`Are you absolutely sure you want to permanently delete the restaurant tenant "${tenant.name}"? This removes all active catalogs, custom files, and database footprints.`)) {
                  deleteTenant(tenant.id);
                }
              }}
                title="De-provision Tenant Node"
                className="w-8.5 h-8.5 rounded-full bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200/60 flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      }
    ],
    [copiedTenantId, deleteTenant, saveTenant]
  );

  const handleCopyCredentials = (tenant: Tenant) => {
    const text = `Restaurant Portal Access:
URL: ${window.location.origin}
Tenant Name: ${tenant.name}
Admin Email: ${tenant.adminEmail}
Admin Password: ${tenant.adminPassword || 'admin'}
Color Scheme: ${tenant.brandColor}`;

    navigator.clipboard.writeText(text);
    setCopiedTenantId(tenant.id);
    addToast(`Copied ${tenant.name} credentials to clipboard!`, 'success');
    setTimeout(() => setCopiedTenantId(null), 2500);
  };

  const handleEditClick = (tenant: Tenant) => {
    setDetailedTenant(tenant);
  };

  const handleToggleSuspend = (tenant: Tenant) => {
    const updated: Tenant = {
      ...tenant,
      status: tenant.status === 'active' ? 'suspended' : 'active'
    };
    saveTenant(updated);
    addToast(`${tenant.name} is now ${updated.status}!`, 'info');
  };

  const handleImpersonateTenant = (tenant: Tenant) => {
    setActiveTenantId(tenant.id);
    useUIStore.setState({ activeNavId: 'dashboard' });
    navigate(`/restaurant/${tenant.id}/dashboard`);
    addToast(`Viewing dashboard of ${tenant.name}. You have live editing access.`, 'success');
  };



  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'starter' | 'premium' | 'enterprise'>('all');

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPlan = planFilter === 'all' || (t.subscriptionPlan || 'premium') === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Extra interactive states for SaaS owner dashboard
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Compute actual plan counts from current tenants list
  const planCounts = useMemo(() => {
    const counts = { starter: 0, premium: 0, enterprise: 0 };
    tenants.forEach(t => {
      const p = t.subscriptionPlan || 'premium';
      if (p === 'starter') counts.starter++;
      else if (p === 'enterprise') counts.enterprise++;
      else counts.premium++;
    });
    return counts;
  }, [tenants]);

  // Real SaaS Volume API Load from backend
  const saasVolumeData = platformStats?.saasVolumeData || [
    { day: 'S', value: 0, fillStyle: 'striped' },
    { day: 'M', value: 0, fillStyle: 'solid-light' },
    { day: 'T', value: 0, fillStyle: 'solid-light' },
    { day: 'W', value: 0, fillStyle: 'solid-dark' },
    { day: 'T', value: 0, fillStyle: 'striped' },
    { day: 'F', value: 0, fillStyle: 'striped' },
    { day: 'S', value: 0, fillStyle: 'striped' }
  ];

  if (detailedTenant) {
    return (
      <RestaurantDetailView
        tenant={detailedTenant}
        onClose={() => setDetailedTenant(null)}
        onSave={(updated) => saveTenant(updated)}
        onImpersonate={handleImpersonateTenant}
        onToggleSuspend={handleToggleSuspend}
        addToast={addToast}
      />
    );
  }

  return (
    <div className="space-y-6 w-full px-4 md:px-6 py-2 text-left font-sans animate-fade-in">

      {/* Top Welcome Title Card replaced with SimplePageHeader */}
      <SimplePageHeader
        title="Operations Center Dashboard"
        description="Manage restaurant stores, check system performance, change plan limits, and watch live store activity."
        categoryTag="Platform Management Panel"
        icon={Shield}
        statusBadge={{
          text: "All systems running smoothly",
          pulseColor: "bg-emerald-500"
        }}
        actions={
          <>
            <Button variant="custom" size="none" onClick={() => navigate('/super-admin/restaurants/create')}
              className="flex items-center gap-2 px-4 h-9.5 text-xs font-bold text-white bg-accent-primary hover:bg-accent-dark rounded-xl transition-all shadow-md shadow-accent-primary/10 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              <Plus size={14} />
              <span>Create New Shop</span>
            </Button>

            <Button variant="custom" size="none" onClick={() => logout()}
              className="px-4 h-9.5 text-xs font-bold text-slate-600 hover:text-slate-850 bg-white hover:bg-slate-50 border border-slate-250/70 rounded-xl shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              Sign Out
            </Button>
          </>
        }
      />

      {/* 4-Column Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 select-none">
        {/* Card 1: Monthly Recurring Revenue (MRR) - navigates to SaaS pricing */}
        <StatCard
          data={{
            id: 'mrr',
            title: 'Monthly Recurring Revenue',
            value: 'Rs. 428,500',
            format: 'currency',
            variant: 'filled',
            trend: { direction: 'up', percent: 12.5, label: 'vs last month' }
          }}
          onClick={() => {
            window.history.pushState(null, '', '/super-admin/plans');
            window.dispatchEvent(new Event('popstate'));
          }}
          actionIcon={<ArrowUpRight size={18} />}
        />

        {/* Card 2: Active Subscribers - opens the create restaurant modal */}
        <StatCard
          data={{
            id: 'active-subscribers',
            title: 'Active Subscribers',
            value: `${tenants.length} stores`,
            format: 'number',
            variant: 'white',
            trend: { direction: 'up', percent: 8, label: 'vs yesterday' }
          }}
          onClick={() => navigate('/super-admin/restaurants/create')}
          actionIcon={<Plus size={16} />}
        />

        {/* Card 3: Support Escalations - navigates to help desk */}
        <StatCard
          data={{
            id: 'escalations',
            title: 'Escalations & Tickets',
            value: '2 tickets',
            format: 'number',
            variant: 'white',
            trend: { direction: 'up', percent: 0, label: 'Requires support response' },
            urgent: true
          }}
          onClick={() => {
            window.history.pushState(null, '', '/super-admin/escalations');
            window.dispatchEvent(new Event('popstate'));
          }}
          actionIcon={<AlertTriangle size={15} />}
        />

        {/* Card 4: Average Customer LTV - navigates to System Health */}
        <StatCard
          data={{
            id: 'ltv',
            title: 'Average Customer LTV',
            value: 'Rs. 18,564',
            format: 'currency',
            variant: 'white',
            trend: { direction: 'up', percent: 3.1, label: 'vs last 30 days' }
          }}
          onClick={() => {
            window.history.pushState(null, '', '/super-admin/cluster');
            window.dispatchEvent(new Event('popstate'));
          }}
          actionIcon={<ArrowUpRight size={16} />}
        />
      </div>

      {/* Operational Platform Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">

        {/* Item 1: Weekly SaaS API load */}
        <div className="bg-white border border-slate-200/70 rounded-[2rem] p-5 md:p-5.5 shadow-sm flex flex-col justify-between h-[340px] relative">
          <div className="space-y-1">
            <h3 className="font-poppins font-bold text-slate-900 text-[16px] leading-tight">Weekly System Performance</h3>
            <p className="text-[11px] font-semibold text-slate-400">Total server requests and store actions made across all your restaurants.</p>
          </div>

          {/* Vertical Capsule Bars */}
          <div className="flex-1 flex items-end justify-between px-2 h-[170px] relative mt-4 mb-2">
            {saasVolumeData.map((item: any, index: number) => {
              const maxVal = 100;
              const barHeight = (item.value / maxVal) * 140;

              return (
                <div
                  key={`${item.day}-${index}`}
                  className="flex flex-col items-center flex-1 relative h-full justify-end cursor-pointer"
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  <AnimatePresence>
                    {hoveredBarIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{ bottom: `${barHeight + 10}px` }}
                        className="absolute z-20 bg-slate-900 text-white font-poppins font-semibold text-[10px] px-2.5 py-0.5 rounded-full shadow-md select-none whitespace-nowrap"
                      >
                        {`${item.value}% active`}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-[2px] w-1.5 h-1.5 bg-slate-900 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-6 sm:w-8 bg-slate-50 border border-slate-100 rounded-full h-full flex items-end overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      style={{
                        height: `${barHeight}px`,
                        transformOrigin: 'bottom',
                        ...(item.fillStyle === 'striped' ? {
                          backgroundImage: `repeating-linear-gradient(45deg, var(--accent-light) 0px, var(--accent-light) 2px, var(--accent-tint-bg) 2px, var(--accent-tint-bg) 6px)`
                        } : {})
                      }}
                      className={`w-full rounded-full transition-all duration-300 ${item.fillStyle === 'solid-dark' ? 'bg-accent-primary' :
                        item.fillStyle === 'solid-light' ? 'bg-accent-light' :
                          'border border-accent-light/20'
                        }`}
                    />
                  </div>

                  <span className="font-poppins font-semibold text-xs text-slate-400 mt-3.5">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Item 2: Subscription Plan Distribution (Real Data) */}
        <div className="bg-white border border-slate-200/70 rounded-[2rem] p-5 md:p-5.5 shadow-sm flex flex-col justify-between h-[340px]">
          <div className="space-y-1">
            <h3 className="font-poppins font-bold text-slate-900 text-[16px] leading-tight">Active Plan Distribution</h3>
            <p className="text-[11px] font-semibold text-slate-400">Current active tenant subscriptions breakdown and scale levels.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4.5 py-2">
            {/* Starter Plan */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Starter Plan
                </span>
                <span className="text-slate-700">{planCounts.starter} stores ({Math.round((planCounts.starter / Math.max(tenants.length, 1)) * 100)}%)</span>
              </div>
              <div className="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(planCounts.starter / Math.max(tenants.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Premium Plan */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Premium Plan
                </span>
                <span className="text-slate-700">{planCounts.premium} stores ({Math.round((planCounts.premium / Math.max(tenants.length, 1)) * 100)}%)</span>
              </div>
              <div className="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${(planCounts.premium / Math.max(tenants.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Enterprise Plan
                </span>
                <span className="text-slate-700">{planCounts.enterprise} stores ({Math.round((planCounts.enterprise / Math.max(tenants.length, 1)) * 100)}%)</span>
              </div>
              <div className="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${(planCounts.enterprise / Math.max(tenants.length, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-bold text-slate-400 select-none">
            <span className="flex items-center gap-1.5"><Network size={12} /> {tenants.length} Total Stores</span>
            <span className="text-indigo-600 font-extrabold uppercase text-[10px]">Active Subscriptions</span>
          </div>
        </div>

        {/* Item 3: Real-time Multi-Tenant Activity Logs */}
        <div className="bg-white border border-slate-200/70 rounded-[2rem] p-5 md:p-5.5 shadow-sm flex flex-col justify-between h-[340px] select-none">
          <div className="space-y-1">
            <h3 className="font-poppins font-bold text-slate-900 text-[16px] leading-tight">Live Store Activity Feed</h3>
            <p className="text-[11px] font-semibold text-slate-400">Real-time updates of orders, promotions, and changes at your restaurants.</p>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mt-4 pr-1">
            {[
              { tenant: "Al-Indolj Karahi", action: "Ahmed Raza completed purchase of Rs. 1,840", time: "Just now", type: "order" },
              { tenant: "Mamma Mia Pizza", action: "Registered promo coupon 'WELCOME10' successfully", time: "3 mins ago", type: "promo" },
              { tenant: "Indolj Karahi", action: "Updated visual brand accent color to #F59E0B", time: "12 mins ago", type: "brand" },
              { tenant: "Burger Craft", action: "Almost reached the daily order limit for the Starter Plan", time: "30 mins ago", type: "warning" },
              { tenant: "Saffron Fine Dining", action: "Set up and copied starter menu data for fine-dining", time: "1 hour ago", type: "provision" }
            ].map((act, i) => (
              <div key={i} className="flex items-center justify-between gap-4 border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${act.type === 'order' ? 'bg-emerald-50 text-emerald-600' :
                    act.type === 'promo' ? 'bg-accent-tint-bg text-accent-primary' :
                      act.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-600'
                    }`}>
                    {act.type === 'order' ? <ShoppingBag size={14} /> :
                      act.type === 'warning' ? <AlertTriangle size={14} /> :
                        act.type === 'promo' ? <Layers size={14} /> :
                          <Utensils size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-slate-800 truncate">{act.tenant}</p>
                    <span className="text-[10px] text-slate-500 font-semibold block truncate mt-0.5">{act.action}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area - Tenants Admin list */}
      <div className="bg-white border border-slate-200/70 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="space-y-1 border-b border-slate-50 pb-4 select-none">
          <h2 className="font-poppins font-bold text-lg text-slate-900 leading-tight">Your Registered Restaurant Stores</h2>
          <p className="text-xs text-slate-400 font-semibold">Manage pricing plans, change colors and logos, and view store admin logins.</p>
        </div>

        <DataTableToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by store name, email, or link..."
          hasActiveFilters={searchQuery !== '' || statusFilter !== 'all' || planFilter !== 'all'}
          onClearFilters={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setPlanFilter('all');
          }}
          filters={
            <div className="flex items-center gap-2.5 animate-fade-in select-none">
              {/* Status Filter Dropdown */}
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-10 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full px-4 focus:outline-none focus:border-indigo-600 cursor-pointer transition-all shadow-xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Stores</option>
                <option value="suspended">Paused Stores</option>
              </Select>

              {/* Subscription Plan Dropdown */}
              <Select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as any)}
                className="h-10 text-xs font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-150 rounded-full px-4 focus:outline-none focus:border-indigo-600 cursor-pointer transition-all shadow-xs"
              >
                <option value="all">All Subscription Plans</option>
                <option value="starter">Starter (Small Store)</option>
                <option value="premium">Premium (Large Store)</option>
                <option value="enterprise">Enterprise (Multi-Branch)</option>
              </Select>
            </div>
          }
        />

        <DataTable
          columns={columns}
          data={filteredTenants}
          isLoading={false}
          emptyMessage="No restaurants found matching your search filters."
          onClearFilters={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setPlanFilter('all');
          }}
          hasActiveFilters={searchQuery !== '' || statusFilter !== 'all' || planFilter !== 'all'}
        />
      </div>
    </div>
  );
}
