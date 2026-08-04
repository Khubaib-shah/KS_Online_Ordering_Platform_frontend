import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardHeader } from './DashboardHeader';
import { StatCardGrid } from './StatCardGrid';
import { TeamCollaborationCard } from './TeamCollaborationCard';
import { RadialProgressCard } from './RadialProgressCard';
import { motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useBranchStore } from '@/store/branchStore';
import { isOwnerOrSuper } from '@/lib/security';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePathname } from '@/lib/security';
import * as Lucide from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

const AnalyticsBarChart = React.lazy(() => import('./AnalyticsBarChart').then(m => ({ default: m.AnalyticsBarChart })));

export function DashboardView() {
  const { currentUser } = useAuthStore();
  const { activeTenantId } = useTenantStore();
  const { branches } = useBranchStore();;
  const [_, navigate] = usePathname();

  const {
    stats,
    analytics,
    secondaryAnalytics,
    orderSources,
    paymentMethods,
    topProducts,
    lowStock,
    branchPerformance,
    recentActivity,
    orders,
    isLoading,
    dateFilter,
    setDateFilter,
    activeBranchFilterId,
    setBranchFilter,
  } = useDashboardData();

  // Helper for synchronized full-path navigation
  const navigateTo = (navId: string) => {
    navigate(`/restaurant/${activeTenantId}/${navId}`);
  };

  // Entrance staggered container animation
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardAnimationVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  const handleAddMenuItem = () => {
    navigateTo('menu');
  };

  const handleExportReport = () => {
    navigateTo('reports');
  };

  const handleStatCardClick = (id: string) => {
    if (id === 'today-revenue' || id === 'avg-order-value') {
      navigateTo('reports');
    } else if (id === 'today-orders') {
      navigateTo('orders');
    } else if (id === 'pending-orders') {
      navigateTo('kitchen');
    }
  };

  // Custom multi-tenant business widgets list
  const widgets = [
    { id: 'sales_summary', title: 'Revenue Overview', enabled: true, gridArea: 'col-span-10 lg:col-span-6' },
    { id: 'orders_breakdown', title: 'Orders Volume Trend', enabled: true, gridArea: 'col-span-10 lg:col-span-4' },

    { id: 'recent_orders', title: "Today's Orders Feed", enabled: true, gridArea: 'col-span-10 lg:col-span-6' },
    { id: 'order_progress', title: 'Order Channel Share', enabled: true, gridArea: 'col-span-10 lg:col-span-4' },

    { id: 'top_products', title: 'Top Selling Products', enabled: true, gridArea: 'col-span-10 lg:col-span-5' },
    { id: 'payment_methods', title: 'Payment Method Breakdown', enabled: true, gridArea: 'col-span-10 lg:col-span-5' },

    { id: 'low_stock', title: 'Low Stock Products', enabled: true, gridArea: 'col-span-10 lg:col-span-5' },
    { id: 'recent_activity', title: 'Recent Activity', enabled: true, gridArea: 'col-span-10 lg:col-span-5' },

    { id: 'quick_actions', title: 'Quick Actions', enabled: true, gridArea: 'col-span-10 lg:col-span-5' },
    { id: 'branch_performance', title: 'Branch Performance', enabled: isOwnerOrSuper(currentUser), gridArea: 'col-span-10 lg:col-span-5' },
  ];

  const renderWidget = (widgetId: string, gridArea: string = '') => {
    switch (widgetId) {
      case 'sales_summary':
        return (
          <motion.div key="sales_summary" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-6"}>
            <React.Suspense fallback={<Skeleton className="h-[340px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />}>
              <AnalyticsBarChart
                data={analytics}
                isLoading={isLoading}
                title="Revenue Overview"
                description="Analysis of total store revenue trends across this outlet."
              />
            </React.Suspense>
          </motion.div>
        );
      case 'orders_breakdown':
        return (
          <motion.div key="orders_breakdown" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-4"}>
            <React.Suspense fallback={<Skeleton className="h-[340px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />}>
              <AnalyticsBarChart
                data={secondaryAnalytics}
                isLoading={isLoading}
                title="Orders Volume Trend"
                description="Total orders completed and processed over time."
              />
            </React.Suspense>
          </motion.div>
        );
      case 'recent_orders':
        return (
          <motion.div key="recent_orders" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-6"}>
            <TeamCollaborationCard orders={orders} isLoading={isLoading} onViewAll={() => navigateTo('orders')} />
          </motion.div>
        );
      case 'order_progress':
        return (
          <motion.div key="order_progress" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-4"}>
            <RadialProgressCard data={orderSources} isLoading={isLoading} />
          </motion.div>
        );
      case 'top_products':
        return (
          <motion.div key="top_products" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-5"}>
            <SectionCard title="Top Selling Products" description="Products with the highest sales revenue." className="h-[340px] flex flex-col justify-between" contentClassName="flex-1 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-3.5 no-scrollbar mt-2">
                {topProducts && topProducts.length > 0 ? (
                  topProducts.map((p, idx) => (
                    <div key={p.name} className="flex items-center justify-between py-1 border-b border-border-subtle/30 last:border-none">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-accent-tint-bg text-accent-primary flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</span>
                        <span className="text-[13px] font-semibold font-inter text-text-primary truncate max-w-[140px] sm:max-w-xs">{p.name}</span>
                      </div>
                      <div className="text-right text-xs font-inter shrink-0 ml-2">
                        <div className="font-bold text-text-primary">Rs. {p.revenue.toLocaleString()}</div>
                        <div className="text-[10px] text-text-secondary">{p.qty} units sold</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary py-12">
                    <span className="text-xs font-medium font-inter">No sales data available.</span>
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        );
      case 'payment_methods':
        return (
          <motion.div key="payment_methods" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-5"}>
            <SectionCard title="Payment Method Breakdown" description="Distribution of payment modes used." className="h-[340px] flex flex-col justify-between" contentClassName="flex-1 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-4 no-scrollbar mt-2 justify-center">
                {paymentMethods && paymentMethods.length > 0 ? (
                  paymentMethods.map((pm) => {
                    const total = paymentMethods.reduce((sum, item) => sum + item.value, 0) || 1;
                    const percent = Math.round((pm.value / total) * 100);
                    return (
                      <div key={pm.name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold font-inter text-text-primary">
                          <span>{pm.name}</span>
                          <span className="font-mono text-[11px] text-text-secondary">{pm.value} orders ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-50 border border-border-subtle/30 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary py-12">
                    <span className="text-xs font-medium font-inter">No data available.</span>
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        );
      case 'low_stock':
        return (
          <motion.div key="low_stock" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-5"}>
            <SectionCard title="Low Stock Products" description="Inventory items running below critical thresholds." className="h-[340px] flex flex-col justify-between" contentClassName="flex-1 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-3.5 no-scrollbar mt-2">
                {lowStock && lowStock.length > 0 ? (
                  lowStock.map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-border-subtle/30 last:border-none">
                      <div>
                        <div className="text-[13px] font-semibold font-inter text-text-primary">{item.name}</div>
                        <div className="text-[10px] font-semibold font-inter text-text-secondary mt-0.5">{item.branchName}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
                          {item.qty} left
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary py-12">
                    <span className="text-xs font-medium font-inter">All inventory levels are healthy.</span>
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        );
      case 'recent_activity':
        return (
          <motion.div key="recent_activity" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-5"}>
            <SectionCard title="Recent Activity" description="Timeline of recent restaurant events." className="h-[340px] flex flex-col justify-between" contentClassName="flex-1 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-4 no-scrollbar mt-2">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((act) => {
                    const IconComp = (Lucide[act.iconKey as keyof typeof Lucide] || Lucide.Activity) as Lucide.LucideIcon;
                    return (
                      <div key={act.id} className="flex items-start gap-3 py-0.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-accent-primary">
                          <IconComp size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center gap-1.5">
                            <h4 className="text-[12.5px] font-semibold font-inter text-text-primary truncate">{act.title}</h4>
                            <span className="text-[10px] font-mono text-text-secondary shrink-0 whitespace-nowrap">{act.time}</span>
                          </div>
                          <p className="text-[11.5px] text-text-secondary mt-0.5 leading-normal truncate">{act.desc}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary py-12">
                    <span className="text-xs font-medium font-inter">No recent activity.</span>
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        );
      case 'quick_actions':
        return (
          <motion.div key="quick_actions" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-5"}>
            <SectionCard title="Quick Actions" description="Instant operations for daily shop routines." className="flex flex-col justify-between" contentClassName="flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-3 mt-2 flex-1 justify-center !py-2">
                <button onClick={() => navigateTo('pos')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-border-subtle bg-white hover:bg-slate-50 hover:border-accent-primary/30 transition-all text-center gap-1.5 cursor-pointer shadow-2xs">
                  <Lucide.ShoppingBag size={18} className="text-accent-primary" />
                  <span className="text-[11px] font-bold text-text-primary font-inter">New POS Order</span>
                </button>
                <button onClick={() => navigateTo('orders')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-border-subtle bg-white hover:bg-slate-50 hover:border-accent-primary/30 transition-all text-center gap-1.5 cursor-pointer shadow-2xs">
                  <Lucide.Receipt size={18} className="text-accent-primary" />
                  <span className="text-[11px] font-bold text-text-primary font-inter">View Orders</span>
                </button>
                <button onClick={() => navigateTo('menu')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-border-subtle bg-white hover:bg-slate-50 hover:border-accent-primary/30 transition-all text-center gap-1.5 cursor-pointer shadow-2xs">
                  <Lucide.PlusCircle size={18} className="text-accent-primary" />
                  <span className="text-[11px] font-bold text-text-primary font-inter">Add Product</span>
                </button>
                <button onClick={() => navigateTo('inventory')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-border-subtle bg-white hover:bg-slate-50 hover:border-accent-primary/30 transition-all text-center gap-1.5 cursor-pointer shadow-2xs">
                  <Lucide.Boxes size={18} className="text-accent-primary" />
                  <span className="text-[11px] font-bold text-text-primary font-inter">Manage Stock</span>
                </button>
                <button onClick={() => navigateTo('reports')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-border-subtle bg-white hover:bg-slate-50 hover:border-accent-primary/30 transition-all text-center gap-1.5 cursor-pointer shadow-2xs col-span-2 py-3.5">
                  <Lucide.BarChart3 size={18} className="text-accent-primary" />
                  <span className="text-[11.5px] font-bold text-text-primary font-inter mt-1">View Reports & Analytics</span>
                </button>
              </div>
            </SectionCard>
          </motion.div>
        );
      case 'branch_performance':
        return (
          <motion.div key="branch_performance" variants={cardAnimationVariants} className={gridArea || "col-span-10 lg:col-span-5"}>
            <SectionCard title="Branch Performance" description="Revenue, order volume, and growth by outlet." className="h-[340px] flex flex-col justify-between" contentClassName="flex-1 flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-3.5 no-scrollbar mt-2">
                {branchPerformance && branchPerformance.length > 0 ? (
                  branchPerformance.map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-1 border-b border-border-subtle/30 last:border-none">
                      <div>
                        <div className="text-[13.5px] font-bold font-inter text-text-primary">{b.name}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{b.orders} orders</div>
                      </div>
                      <div className="text-right text-xs font-inter">
                        <div className="font-bold text-text-primary">Rs. {b.revenue.toLocaleString()}</div>
                        <span className={`text-[10px] font-bold ${b.growth >= 0 ? 'text-[#156A45]' : 'text-rose-600'} block mt-0.5`}>
                          {b.growth >= 0 ? '+' : ''}{b.growth}% growth
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary py-12">
                    <span className="text-xs font-medium font-inter">No branch data available.</span>
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Determine whether to display the branch filter
  const showBranchFilter = isOwnerOrSuper(currentUser);

  return (
    <div className="flex flex-col select-none">
      {/* Header with branch filter and date filter parameters passed */}
      <DashboardHeader
        onAddMenuItem={handleAddMenuItem}
        onExportReport={handleExportReport}
        branchFilter={activeBranchFilterId}
        onBranchFilterChange={setBranchFilter}
        dateFilter={dateFilter as any}
        onDateFilterChange={setDateFilter}
        showBranchFilter={showBranchFilter}
        branches={branches}
      />

      {/* 6-Column Stat Cards Row */}
      <StatCardGrid
        stats={stats}
        isLoading={isLoading}
        onCardClick={handleStatCardClick}
      />

      {/* 10-Column Responsive Layout Grid (Bento style) */}
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-10 gap-4 sm:gap-5 lg:gap-6 mb-8"
      >
        {widgets
          .filter(w => w.enabled)
          .map(w => renderWidget(w.id, w.gridArea))
        }
      </motion.div>
    </div>
  );
}
