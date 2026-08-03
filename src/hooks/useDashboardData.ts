import { useState, useEffect, useMemo } from 'react';
import * as api from '../lib/api/dashboard.api';
import { StatCardData, AnalyticsDataPoint, ReminderData, ActionItem, ProgressData } from '@/types/dashboard';
import { OrderFeedItem, Order } from '@/types/order';
import { AdminUser } from '@/types/user';
import { useOrders } from './useOrders';
import { useUIStore } from '@/store/uiStore';
import { useBranchStore } from '@/store/branchStore';
import {
  getOrderDateRangeFilter,
  getOrderPreviousPeriodFilter,
  getAnalyticsPoints
} from './dashboardHelpers';

export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  desc: string;
  time: string;
  iconKey: string;
}

export interface DashboardData {
  stats: StatCardData[] | null;
  analytics: AnalyticsDataPoint[] | null;
  secondaryAnalytics: AnalyticsDataPoint[] | null;
  orderSources: { percent: number; label: string; segments: { label: string; color: string; value: number }[] } | null;
  paymentMethods: { name: string; value: number }[] | null;
  recentOrders: Order[] | null;
  orders: OrderFeedItem[] | null;
  topProducts: { name: string; qty: number; revenue: number }[] | null;
  lowStock: { name: string; qty: number; minStock: number; branchName: string }[] | null;
  branchPerformance: { id: string; name: string; revenue: number; orders: number; growth: number }[] | null;
  recentActivity: RecentActivityItem[] | null;
  reminder: ReminderData | null;
  tasks: ActionItem[] | null;
  progress: ProgressData | null;
  user: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  activeBranchFilterId: string;
  setBranchFilter: (id: string) => void;
}

export function useDashboardData() {
  const { orders: realOrders, isLoading: isOrdersLoading, refetch: refetchOrders } = useOrders();
  const { activeBranchFilterId, setBranchFilter, branches, inventory, stockMovements } = useBranchStore();
  const { dashboardDateFilter, setDashboardDateFilter } = useUIStore();

  const [staticData, setStaticData] = useState<{
    reminder: ReminderData | null;
    tasks: ActionItem[] | null;
    progress: ProgressData | null;
    user: AdminUser | null;
  }>({
    reminder: null,
    tasks: null,
    progress: null,
    user: null,
  });

  const [isStaticLoading, setIsStaticLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStaticData() {
      try {
        setIsStaticLoading(true);
        const [reminder, tasks, progress, user] = await Promise.all([
          api.getReminder(),
          api.getTasks(),
          api.getProgressData(),
          api.getUserProfile(),
        ]);

        if (isMounted) {
          setStaticData({
            reminder,
            tasks,
            progress,
            user,
          });
          setIsStaticLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
          setIsStaticLoading(false);
        }
      }
    }

    fetchStaticData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter orders by selected branch and date filter
  const periodOrders = useMemo(() => {
    if (isOrdersLoading) return [];
    return realOrders.filter(o => {
      if (activeBranchFilterId && activeBranchFilterId !== 'all') {
        if (o.branchId !== activeBranchFilterId) return false;
      }
      const orderDate = new Date(o.placedAt);
      if (isNaN(orderDate.getTime())) return false;
      return getOrderDateRangeFilter(orderDate, dashboardDateFilter);
    });
  }, [realOrders, isOrdersLoading, activeBranchFilterId, dashboardDateFilter]);

  // Filter orders for previous period
  const prevPeriodOrders = useMemo(() => {
    if (isOrdersLoading) return [];
    return realOrders.filter(o => {
      if (activeBranchFilterId && activeBranchFilterId !== 'all') {
        if (o.branchId !== activeBranchFilterId) return false;
      }
      const orderDate = new Date(o.placedAt);
      if (isNaN(orderDate.getTime())) return false;
      return getOrderPreviousPeriodFilter(orderDate, dashboardDateFilter);
    });
  }, [realOrders, isOrdersLoading, activeBranchFilterId, dashboardDateFilter]);

  // Compute stats dynamically from periodOrders
  const computedStats = useMemo<StatCardData[] | null>(() => {
    if (isOrdersLoading) return null;

    const currentRevenue = periodOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.grandTotal, 0);
    const prevRevenue = prevPeriodOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.grandTotal, 0);
    const revDiff = currentRevenue - prevRevenue;
    const revGrowth = prevRevenue > 0 ? Math.round((revDiff / prevRevenue) * 100) : 0;

    const currentOrdersCount = periodOrders.length;
    const prevOrdersCount = prevPeriodOrders.length;
    const ordDiff = currentOrdersCount - prevOrdersCount;
    const ordGrowth = prevOrdersCount > 0 ? Math.round((ordDiff / prevOrdersCount) * 100) : 0;

    const currentSuccessfulOrders = periodOrders.filter(o => o.status !== 'CANCELLED');
    const currentAOV = currentSuccessfulOrders.length > 0 ? Math.round(currentRevenue / currentSuccessfulOrders.length) : 0;
    const prevSuccessfulOrders = prevPeriodOrders.filter(o => o.status !== 'CANCELLED');
    const prevAOV = prevSuccessfulOrders.length > 0 ? Math.round(prevRevenue / prevSuccessfulOrders.length) : 0;
    const aovDiff = currentAOV - prevAOV;
    const aovGrowth = prevAOV > 0 ? Math.round((aovDiff / prevAOV) * 100) : 0;

    const pendingOrdersCount = periodOrders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length;

    return [
      {
        id: 'today-revenue',
        title: "Total Revenue",
        value: `Rs. ${currentRevenue.toLocaleString()}`,
        format: 'currency',
        trend: {
          direction: revGrowth >= 0 ? 'up' : 'down',
          percent: Math.abs(revGrowth),
          label: 'vs previous period'
        },
        variant: 'filled',
      },
      {
        id: 'today-orders',
        title: "Total Orders",
        value: currentOrdersCount,
        format: 'number',
        trend: {
          direction: ordGrowth >= 0 ? 'up' : 'down',
          percent: Math.abs(ordGrowth),
          label: 'vs previous period'
        },
        variant: 'white',
      },
      {
        id: 'avg-order-value',
        title: "Avg Order Value",
        value: `Rs. ${currentAOV.toLocaleString()}`,
        format: 'currency',
        trend: {
          direction: aovGrowth >= 0 ? 'up' : 'down',
          percent: Math.abs(aovGrowth),
          label: 'vs previous period'
        },
        variant: 'white',
      },
      {
        id: 'pending-orders',
        title: 'Pending Orders',
        value: pendingOrdersCount,
        format: 'number',
        trend: { direction: 'up', percent: 0, label: 'Needs attention' },
        variant: 'white',
        urgent: pendingOrdersCount > 0,
      },
    ];
  }, [periodOrders, prevPeriodOrders, isOrdersLoading]);

  // Compute weekly revenue analytics based on real orders
  const computedAnalytics = useMemo<AnalyticsDataPoint[] | null>(() => {
    if (isOrdersLoading) return null;
    return getAnalyticsPoints(periodOrders, dashboardDateFilter, 'revenue');
  }, [periodOrders, dashboardDateFilter, isOrdersLoading]);

  // Secondary Chart - Orders over time split
  const secondaryAnalytics = useMemo<AnalyticsDataPoint[] | null>(() => {
    if (isOrdersLoading) return null;
    return getAnalyticsPoints(periodOrders, dashboardDateFilter, 'orders');
  }, [periodOrders, dashboardDateFilter, isOrdersLoading]);

  // Order Source Breakdown (Online Share)
  const orderSources = useMemo(() => {
    const online = periodOrders.filter(o => o.delivery.type === 'DELIVERY').length;
    const walkIn = periodOrders.filter(o => o.delivery.type !== 'DELIVERY').length;
    const total = online + walkIn;
    return {
      percent: total > 0 ? Math.round((online / total) * 100) : 0,
      label: 'ONLINE ORDERS SHARE',
      segments: [
        { label: 'Online Orders', color: 'bg-[#156A45]', value: online },
        { label: 'Walk-in Orders', color: 'bg-[#66C18C]', value: walkIn }
      ]
    };
  }, [periodOrders]);

  // Payment Method Breakdown
  const paymentMethods = useMemo(() => {
    const cash = periodOrders.filter(o => o.paymentMethod === 'COD' || o.paymentMethod === 'CASH').length;
    const card = periodOrders.filter(o => o.paymentMethod === 'CARD').length;
    const easypaisa = periodOrders.filter(o => o.paymentMethod === 'WALLET').length;
    const jazzcash = periodOrders.filter(o => o.paymentMethod === 'ONLINE').length;
    const bank = periodOrders.filter(o => o.paymentMethod === 'BANK_TRANSFER').length;

    return [
      { name: 'Cash', value: cash },
      { name: 'Card', value: card },
      { name: 'Easypaisa', value: easypaisa },
      { name: 'JazzCash', value: jazzcash },
      { name: 'Bank Transfer', value: bank }
    ].sort((a, b) => b.value - a.value);
  }, [periodOrders]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    periodOrders.forEach(o => {
      if (o.status !== 'CANCELLED') {
        o.items.forEach(item => {
          const prev = map.get(item.name) || { qty: 0, revenue: 0 };
          map.set(item.name, {
            qty: prev.qty + item.qty,
            revenue: prev.revenue + item.total
          });
        });
      }
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        qty: data.qty,
        revenue: Math.round(data.revenue)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [periodOrders]);

  // Low Stock Products
  const lowStock = useMemo(() => {
    const filteredInventory = inventory.filter(item => {
      if (activeBranchFilterId && activeBranchFilterId !== 'all') {
        if (item.branchId !== activeBranchFilterId) return false;
      }
      return item.qty < 15;
    });

    return filteredInventory.map(item => {
      const bObj = branches.find(b => b.id === item.branchId);
      return {
        name: item.itemName,
        qty: item.qty,
        minStock: 15,
        branchName: bObj ? bObj.area : 'Main Store'
      };
    }).slice(0, 5);
  }, [inventory, activeBranchFilterId, branches]);

  // Branch Performance
  const branchPerformance = useMemo(() => {
    return branches.map(b => {
      const branchOrders = realOrders.filter(o => o.branchId === b.id && getOrderDateRangeFilter(new Date(o.placedAt), dashboardDateFilter));
      const prevBranchOrders = realOrders.filter(o => o.branchId === b.id && getOrderPreviousPeriodFilter(new Date(o.placedAt), dashboardDateFilter));

      const rev = branchOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.grandTotal, 0);
      const prevRev = prevBranchOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.grandTotal, 0);

      const diff = rev - prevRev;
      const growth = prevRev > 0 ? Math.round((diff / prevRev) * 100) : 0;

      return {
        id: b.id,
        name: b.area,
        revenue: Math.round(rev),
        orders: branchOrders.length,
        growth
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [branches, realOrders, dashboardDateFilter]);

  // Recent Activity timeline events
  const recentActivity = useMemo(() => {
    const list: RecentActivityItem[] = [];

    periodOrders.slice(0, 4).forEach((o) => {
      const timeStr = new Date(o.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      list.push({
        id: `act-ord-${o.id || o.orderNumber}`,
        type: 'order',
        title: o.status === 'DELIVERED' ? 'Order Delivered' : 'New POS Order',
        desc: `Order #${o.orderNumber} for Rs. ${o.grandTotal.toLocaleString()} (${o.customer?.name || 'Walk-in'})`,
        time: timeStr,
        iconKey: 'ShoppingBag'
      });
    });

    stockMovements.slice(0, 2).forEach(m => {
      const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const bObj = branches.find(b => b.id === m.branchId);
      list.push({
        id: `act-inv-${m.id}`,
        type: 'inventory',
        title: `Stock ${m.type === 'in' ? 'Added' : 'Released'}`,
        desc: `${m.qty}x ${m.itemName} at ${bObj ? bObj.area : 'Branch'}`,
        time: timeStr,
        iconKey: 'Layers'
      });
    });

    if (list.length < 6) {
      const fallbacks = [
        { id: 'act-fall-1', type: 'system', title: 'Product Inventory Synchronized', desc: 'Global inventory catalog verified across all 3 outlets.', time: '09:15 AM', iconKey: 'ShieldAlert' },
        { id: 'act-fall-2', type: 'system', title: 'Promotion Activated', desc: 'Promo "FLAT10" applied successfully on checkout.', time: 'Yesterday', iconKey: 'Sparkles' },
        { id: 'act-fall-3', type: 'employee', title: 'New Employee Registered', desc: 'Staff member added with kitchen permissions.', time: '2 days ago', iconKey: 'Users' }
      ];
      return [...list, ...fallbacks].slice(0, 6);
    }

    return list.slice(0, 6);
  }, [periodOrders, stockMovements, branches]);

  // Map real orders to OrderFeedItem structure for the feed card
  const feedOrders = useMemo<OrderFeedItem[] | null>(() => {
    if (isOrdersLoading) return null;
    return periodOrders.slice(0, 5).map(o => ({
      id: o.orderNumber,
      customerName: o.customer.name,
      orderSummary: o.items.map(item => `${item.qty}x ${item.name}`).join(', '),
      total: o.grandTotal,
      status: o.status === 'DELIVERED' ? 'DELIVERED' : o.status === 'PENDING' ? 'PENDING' : 'PREPARING',
      placedAt: new Date(o.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }, [periodOrders, isOrdersLoading]);

  return {
    stats: computedStats,
    analytics: computedAnalytics,
    secondaryAnalytics,
    orderSources,
    paymentMethods,
    recentOrders: periodOrders.slice(0, 5),
    topProducts,
    lowStock,
    branchPerformance,
    recentActivity,
    orders: feedOrders,
    reminder: staticData.reminder,
    tasks: staticData.tasks,
    progress: staticData.progress,
    user: staticData.user,
    isLoading: isOrdersLoading || isStaticLoading,
    error,
    refetch: refetchOrders,
    dateFilter: dashboardDateFilter,
    setDateFilter: setDashboardDateFilter,
    activeBranchFilterId,
    setBranchFilter,
  };
}
