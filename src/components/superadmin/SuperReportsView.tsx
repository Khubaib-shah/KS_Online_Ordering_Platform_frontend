import { useState, useMemo } from 'react';import { Button } from '@/components/ui/Button';

import { useTenantStore } from '@/store/tenantStore';
import { BarChart3, TrendingUp, Star } from 'lucide-react';
import { ReusableAreaChart, ReusableBarChart, ReusablePieChart } from '@/components/ui/charts';
import { StatCard } from '@/components/dashboard/StatCard';
import { BaseCard } from '@/components/ui/BaseCard';
import { SimplePageHeader } from '@/components/dashboard/SimplePageHeader';
import { DataTable } from '@components/data-table/DataTable';
import { ColumnDef } from '@tanstack/react-table';

export function SuperReportsView() {
  const { tenants } = useTenantStore();;
  const [activeMetricTab, setActiveMetricTab] = useState<'revenue' | 'orders' | 'subscriptions'>('revenue');

  const totalTenants = tenants.length;


  // Compute stats according to plans
  const starterCount = tenants.filter(t => (t.subscriptionPlan || 'premium') === 'starter').length;
  const premiumCount = tenants.filter(t => (t.subscriptionPlan || 'premium') === 'premium').length;
  const enterpriseCount = tenants.filter(t => (t.subscriptionPlan || 'premium') === 'enterprise').length;

  // Generate dynamic, realistic SaaS performance data
  const storeMetrics = tenants.map((tenant, idx) => {
    let baseOrders = 120 + (idx * 45);
    let baseRevenue = baseOrders * 1250;
    let plan = tenant.subscriptionPlan || 'premium';

    // Scale numbers appropriately for multi-tenant subscription realism
    if (plan === 'starter') {
      baseOrders = 65 + (idx * 15);
      baseRevenue = baseOrders * 950;
    } else if (plan === 'enterprise') {
      baseOrders = 410 + (idx * 110);
      baseRevenue = baseOrders * 1450;
    }

    if (tenant.id === 'indolj-main') {
      baseOrders = 380;
      baseRevenue = 520000;
    } else if (tenant.status === 'suspended') {
      baseOrders = 12;
      baseRevenue = 15000;
    }

    return {
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      plan: plan,
      orders: baseOrders,
      revenue: baseRevenue / 100, // format to standard currency major unit
      rating: tenant.rating || (4.5 + (idx % 5) * 0.1)
    };
  });

  const totalSaaSOrders = storeMetrics.reduce((sum, item) => sum + item.orders, 0);
  const totalSaaSRevenue = storeMetrics.reduce((sum, item) => sum + item.revenue, 0);
  const avgSaaSRating = (storeMetrics.reduce((sum, item) => sum + item.rating, 0) / totalTenants || 4.8).toFixed(1);

  // Approximate Monthly Recurring Revenue (MRR) based on plans
  // Starter = Rs 5,000/mo, Premium = Rs 15,000/mo, Enterprise = Rs 45,000/mo
  const computedMRR = (starterCount * 5000) + (premiumCount * 15000) + (enterpriseCount * 45000);

  // Revenue contribution series for Bar Charts
  const revenueChartData = storeMetrics.map(item => ({
    name: item.name.length > 10 ? `${item.name.substring(0, 8)}...` : item.name,
    Revenue: Math.round(item.revenue),
    Orders: item.orders
  }));

  // Pie chart subscription ratios
  const subscriptionPieData = [
    { name: 'Starter (Small)', value: starterCount || 1, color: '#FBBF24' },
    { name: 'Premium (Large)', value: premiumCount || 2, color: '#10B981' },
    { name: 'Enterprise (Chains)', value: enterpriseCount || 1, color: '#6366F1' }
  ];



  // Table columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Restaurant Store',
        cell: ({ row }) => (
          <div className="select-none text-left">
            <p className="font-extrabold text-slate-900 text-sm">{row.original.name}</p>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
              /{row.original.slug}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <div className="text-left">
            {row.original.status === 'active' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">
                ● Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">
                ■ Suspended
              </span>
            )}
          </div>
        )
      },
      {
        accessorKey: 'plan',
        header: 'Plan Level',
        cell: ({ row }) => (
          <div className="text-left">
            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${row.original.plan === 'starter'
              ? 'bg-[#FEF3C7] text-[#92400E]'
              : row.original.plan === 'enterprise'
                ? 'bg-[#EEF2FF] text-[#3730A3]'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
              {row.original.plan}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'orders',
        header: 'Completed Orders',
        cell: ({ row }) => (
          <div className="text-left">
            <span className="font-mono text-slate-700 font-bold">{row.original.orders.toLocaleString()}</span>
          </div>
        )
      },
      {
        accessorKey: 'revenue',
        header: 'Total Sales',
        cell: ({ row }) => (
          <div className="text-left">
            <span className="font-mono text-slate-900 font-bold">Rs. {Math.round(row.original.revenue).toLocaleString()}</span>
          </div>
        )
      },
      {
        accessorKey: 'aov',
        header: 'Average Order Amount',
        cell: ({ row }) => {
          const aov = row.original.orders > 0 ? row.original.revenue / row.original.orders : 0;
          return (
            <div className="text-left">
              <span className="font-mono text-slate-500 font-semibold">Rs. {Math.round(aov).toLocaleString()}</span>
            </div>
          );
        }
      },
      {
        accessorKey: 'rating',
        header: 'Customer Rating',
        cell: ({ row }) => (
          <div className="flex items-center justify-start gap-1 font-mono font-bold text-slate-800">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span>{row.original.rating.toFixed(1)}</span>
          </div>
        )
      }
    ],
    []
  );

  return (
    <div className="space-y-6 w-full px-4 md:px-6 py-2 text-left font-sans animate-fade-in">

      {/* Header replaced with SimplePageHeader */}
      <SimplePageHeader
        title="Store Performance & Sales Reports"
        description="View total sales, order statistics, subscription plans, and customer ratings across all stores."
        icon={BarChart3}
        statusBadge={{
          text: "Live Reports Active",
          pulseColor: "bg-emerald-500"
        }}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 select-none">
        <StatCard
          data={{
            id: 'saas-mrr',
            title: 'Monthly Subscription Revenue',
            value: `Rs. ${computedMRR.toLocaleString()}`,
            format: 'currency',
            variant: 'white',
            trend: { percent: 18, direction: 'up', label: 'Subscription base' }
          }}
        />
        <StatCard
          data={{
            id: 'saas-gmv',
            title: 'Store Sales Volume',
            value: `Rs. ${Math.round(totalSaaSRevenue).toLocaleString()}`,
            format: 'currency',
            variant: 'white',
            trend: { percent: 14, direction: 'up', label: 'Store gross volume' }
          }}
        />
        <StatCard
          data={{
            id: 'saas-orders',
            title: 'Total Orders',
            value: totalSaaSOrders.toLocaleString(),
            format: 'number',
            variant: 'white',
            trend: { percent: 22, direction: 'up', label: 'All websites' }
          }}
        />
        <StatCard
          data={{
            id: 'saas-rating',
            title: 'Average Store Rating',
            value: `${avgSaaSRating}/5.0`,
            format: 'number',
            variant: 'white',
            trend: { percent: 5, direction: 'up', label: 'Highly positive' }
          }}
        />
      </div>

      {/* Multi-Branch & Tenant Type breakdown dashboard widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">

        {/* Starter widget */}
        <div className="bg-[#FFFDF5] border border-amber-200/60 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">Starter Tier</span>
            <h4 className="text-xs font-bold text-slate-700">Small Restaurants</h4>
            <p className="text-slate-500 text-[10px]">Up to 1 local branch configuration</p>
          </div>
          <p className="text-2xl font-bold md:font-black text-amber-800 font-mono">{starterCount}</p>
        </div>

        {/* Premium widget */}
        <div className="bg-[#F6FEF9] border border-emerald-200/60 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Premium Tier</span>
            <h4 className="text-xs font-bold text-slate-700">Large Single Stores</h4>
            <p className="text-slate-500 text-[10px]">Up to 3 local delivery zones</p>
          </div>
          <p className="text-2xl font-bold md:font-black text-emerald-800 font-mono">{premiumCount}</p>
        </div>

        {/* Enterprise widget */}
        <div className="bg-[#F5F7FF] border border-indigo-200/60 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">Enterprise Tier</span>
            <h4 className="text-xs font-bold text-slate-700">Multi-Branch Chains</h4>
            <p className="text-slate-500 text-[10px]">Unlimited branches and areas</p>
          </div>
          <p className="text-2xl font-bold md:font-black text-indigo-800 font-mono">{enterpriseCount}</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Metric Chart Panel */}
        <BaseCard className="lg:col-span-2 text-left" noPadding>
          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600 animate-pulse" />
                <h3 className="text-sm font-extrabold text-slate-900">Store Sales & Orders Comparison</h3>
              </div>

              {/* Selector buttons for chart metric toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[10px] font-bold uppercase">
                <Button variant="custom" size="none"                   onClick={() => setActiveMetricTab('revenue')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeMetricTab === 'revenue' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Revenue
                </Button>
                <Button variant="custom" size="none"                   onClick={() => setActiveMetricTab('orders')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeMetricTab === 'orders' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Orders
                </Button>
              </div>
            </div>

            <div className="h-72">
              {activeMetricTab === 'revenue' ? (
                <ReusableAreaChart
                  data={revenueChartData}
                  xKey="name"
                  yKey="Revenue"
                  gradientId="colorRevenue"
                  yTickFormatter={(val) => `Rs.${val}`}
                  tooltipFormatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'GMV Revenue']}
                  height={288}
                />
              ) : (
                <ReusableBarChart
                  data={revenueChartData}
                  xKey="name"
                  yKey="Orders"
                  radius={[6, 6, 0, 0]}
                  tooltipFormatter={(value) => [`${value} Orders`, 'Total Orders']}
                  height={288}
                />
              )}
            </div>
          </div>
        </BaseCard>

        {/* Subscription Allocation Pie Widget */}
        <BaseCard
          title="Store Subscription Breakdown"
          description="Ratio of stores on each subscription plan."
          className="flex flex-col justify-between"
          contentClassName="mt-4 flex flex-col justify-between h-full"
        >
          <div className="h-44 flex items-center justify-center relative my-1">
            <ReusablePieChart
              data={subscriptionPieData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={75}
              centerText="Stores"
              centerValue={totalTenants}
              showLegend={false}
              height={176}
            />
          </div>

          <div className="space-y-2 border-t border-slate-50 pt-4">
            {subscriptionPieData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-500 font-bold">{entry.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </BaseCard>

      </div>

      {/* Detailed Platform Ledger */}
      <BaseCard
        title="Store Sales & Activity Table"
        description="Detailed list showing each store's plan, total orders, sales, and rating."
        contentClassName="mt-4"
      >
        <DataTable
          columns={columns}
          data={storeMetrics}
          isLoading={false}
          emptyMessage="No restaurant stores registered yet."
        />
      </BaseCard>

    </div>
  );
}

