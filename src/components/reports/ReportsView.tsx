import { Select } from '@/components/ui/Select';
import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { useReportsData } from '@/hooks/useReportsData';
import {
  Download,
  Calendar
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { StatCard } from '../dashboard/StatCard';
import { DishPerformanceTable } from './components/DishPerformanceTable';
import { DiscountImpactList } from './components/DiscountImpactList';
import { Skeleton } from '../ui/Skeleton';

const FinancialGrossOutputChart = React.lazy(() => import('./components/FinancialGrossOutputChart').then(m => ({ default: m.FinancialGrossOutputChart })));
const ServiceChannelSplitChart = React.lazy(() => import('./components/ServiceChannelSplitChart').then(m => ({ default: m.ServiceChannelSplitChart })));
const CategoryContributionChart = React.lazy(() => import('./components/CategoryContributionChart').then(m => ({ default: m.CategoryContributionChart })));
const SalesChannelChart = React.lazy(() => import('./components/SalesChannelChart').then(m => ({ default: m.SalesChannelChart })));
const TopCustomersList = React.lazy(() => import('./components/TopCustomersList').then(m => ({ default: m.TopCustomersList })));

export function ReportsView() {
  const { addToast } = useUIStore();;
  const { reportsData, isLoading, dateRange, setDateRange, exportCsv } = useReportsData();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handleExport = async (type: 'orders' | 'items' | 'customers' | 'all') => {
    setIsExporting(type);
    try {
      await exportCsv(type);
      addToast(`CSV export for ${type} generated and downloaded!`, 'success');
    } catch (err) {
      addToast('Failed to generate CSV export', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const summary = reportsData?.summary || { revenue: 0, revenueDelta: 0, ordersCount: 0, ordersDelta: 0, avgOrderValue: 0, avgOrderValueDelta: 0 };
  const revenueTrend = reportsData?.revenueTrend || [];
  const orderTypeBreakdown = reportsData?.orderTypeBreakdown || [];
  const categoryPerformance = reportsData?.categoryPerformance || [];
  const bestSellers = reportsData?.bestSellers || [];
  const worstSellers = reportsData?.worstSellers || [];
  const discountImpact = reportsData?.discountImpact || [];
  const topCustomers = reportsData?.topCustomers || [];
  const newVsReturning = reportsData?.newVsReturning || [];

  const activeCustomersCount = newVsReturning.reduce((acc, curr) => acc + curr.value, 0);
  const returningCount = newVsReturning.find(i => i.name === 'Returning Customers')?.value || 0;
  const repeatRate = activeCustomersCount > 0 ? (returningCount / activeCustomersCount) * 100 : 0;

  return (
    <div className="w-full flex flex-col select-none animate-fade-in pb-12">

      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary tracking-tight leading-[1.2]">
            Analytics & Reports
          </h1>
          <p className="text-[15px] sm:text-base text-text-secondary mt-1 leading-[1.5]">
            Analyze financial trends, examine category outputs, and download raw spreadsheet compliance logs.
          </p>
        </div>

        {/* Range select & Export controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Range select dropdown */}
          <div className="flex items-center gap-2.5 bg-white border border-border-subtle rounded-full px-4 h-10 shadow-sm">
            <Calendar size={14} className="text-text-secondary" />
            <Select
              value={dateRange}
              onChange={(e: any) => setDateRange(e.target.value)}
              className="text-xs font-semibold text-text-primary outline-none bg-transparent cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="month">This Month</option>
            </Select>
          </div>

          {/* Export Dropdown Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={14} className={isExporting ? "animate-spin" : ""} />}
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="rounded-full px-4 h-10"
            >
              Export
            </Button>

            {exportDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white border border-border-subtle/80 rounded-2xl shadow-shell z-50 py-1.5 overflow-hidden animate-fade-in origin-top-right">
                  <Button variant="custom" size="none" onClick={() => {
                    handleExport('all');
                    setExportDropdownOpen(false);
                  }}
                    disabled={isExporting !== null}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-slate-50 flex items-center justify-between transition-colors disabled:opacity-50"
                  >
                    <span>Metrics Summary</span>
                    {isExporting === 'all' && <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping" />}
                  </Button>
                  <Button variant="custom" size="none" onClick={() => {
                    handleExport('orders');
                    setExportDropdownOpen(false);
                  }}
                    disabled={isExporting !== null}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-slate-50 flex items-center justify-between transition-colors disabled:opacity-50"
                  >
                    <span>Orders Audit (CSV)</span>
                    {isExporting === 'orders' && <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping" />}
                  </Button>
                  <Button variant="custom" size="none" onClick={() => {
                    handleExport('items');
                    setExportDropdownOpen(false);
                  }}
                    disabled={isExporting !== null}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-slate-50 flex items-center justify-between transition-colors disabled:opacity-50"
                  >
                    <span>Products Catalog</span>
                    {isExporting === 'items' && <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping" />}
                  </Button>
                  <Button variant="custom" size="none" onClick={() => {
                    handleExport('customers');
                    setExportDropdownOpen(false);
                  }}
                    disabled={isExporting !== null}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-slate-50 flex items-center justify-between transition-colors disabled:opacity-50"
                  >
                    <span>Customers Log</span>
                    {isExporting === 'customers' && <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping" />}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Primary Key metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-4 sm:mb-5 lg:mb-6">
        <StatCard
          isLoading={isLoading}
          data={{
            id: 'revenue',
            title: 'Gross Revenue',
            value: `Rs. ${summary.revenue.toLocaleString()}`,
            format: 'currency',
            variant: 'white',
            trend: {
              percent: summary.revenueDelta,
              direction: summary.revenueDelta >= 0 ? 'up' : 'down',
              label: 'vs last month'
            }
          }}
        />

        <StatCard
          isLoading={isLoading}
          data={{
            id: 'orders',
            title: 'Total Sales count',
            value: `${summary.ordersCount} orders`,
            format: 'number',
            variant: 'white',
            trend: {
              percent: summary.ordersDelta,
              direction: summary.ordersDelta >= 0 ? 'up' : 'down',
              label: 'vs last month'
            }
          }}
        />

        <StatCard
          isLoading={isLoading}
          data={{
            id: 'aov',
            title: 'Average Ticket (AOV)',
            value: `Rs. ${summary.avgOrderValue.toLocaleString()}`,
            format: 'currency',
            variant: 'white',
            trend: {
              percent: summary.avgOrderValueDelta,
              direction: summary.avgOrderValueDelta >= 0 ? 'up' : 'down',
              label: 'vs last month'
            }
          }}
        />

        <StatCard
          isLoading={isLoading}
          data={{
            id: 'active',
            title: 'Active Customers',
            value: `${activeCustomersCount} clients`,
            format: 'number',
            variant: 'white',
            trend: {
              percent: Number(repeatRate.toFixed(1)),
              direction: 'up',
              label: 'repeat buyers'
            }
          }}
        />
      </div>

      {/* Visual Charts Layout Row (take 2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-4 sm:mb-5 lg:mb-6">
        {/* 1. Monthly revenue curve trend Line chart (takes 2/3 space) */}
        {isLoading ? (
          <div className="lg:col-span-2 h-[350px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />
        ) : (
          <Suspense fallback={<Skeleton className="lg:col-span-2 h-[350px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />}>
            <FinancialGrossOutputChart revenueTrend={revenueTrend} />
          </Suspense>
        )}

        {/* 2. Order service types division Donut Ring chart (takes 1/3 space) */}
        {isLoading ? (
          <div className="h-[350px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />
        ) : (
          <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />}>
            <SalesChannelChart channelBreakdown={reportsData?.channelBreakdown || []} />
          </Suspense>
        )}
      </div>

      {/* Customer Tracking Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-4 sm:mb-5 lg:mb-6">
        {/* Top Customers List */}
        <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />}>
          <TopCustomersList customers={topCustomers} isLoading={isLoading} />
        </Suspense>

        {/* Fulfillment split chart (moved here) */}
        {isLoading ? (
          <div className="h-[400px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />
        ) : (
          <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />}>
            <ServiceChannelSplitChart orderTypeBreakdown={orderTypeBreakdown} />
          </Suspense>
        )}
      </div>

      {/* Best Sellers & Worst Sellers side-by-side table rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-4 sm:mb-5 lg:mb-6">
        {/* 1. Best Sellers List */}
        <DishPerformanceTable title="Best Sellers (Top 10 Dishes)" type="best" items={bestSellers} isLoading={isLoading} />

        {/* 2. Worst Sellers List */}
        <DishPerformanceTable title="Underperforming Items (Bottom 10 Dishes)" type="worst" items={worstSellers} isLoading={isLoading} />
      </div>

      {/* Category Performance & Discount Campaign Impacts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {/* Category Contribution Bar chart (takes 2/3 space) */}
        {isLoading ? (
          <div className="lg:col-span-2 h-[350px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />
        ) : (
          <Suspense fallback={<Skeleton className="lg:col-span-2 h-[350px] w-full rounded-2xl animate-pulse bg-surface-muted border border-border-subtle" />}>
            <CategoryContributionChart categoryPerformance={categoryPerformance} />
          </Suspense>
        )}

        {/* Coupon Discount Impact Breakdown (takes 1/3 space) */}
        <DiscountImpactList discountImpact={discountImpact} isLoading={isLoading} />
      </div>

    </div>
  );
}
