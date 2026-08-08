import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as api from '../lib/api/dashboard.api';
import { StatCardData, AnalyticsDataPoint, ReminderData, ActionItem, ProgressData } from '@/types/dashboard';
import { OrderFeedItem, Order } from '@/types/order';
import { AdminUser } from '@/types/user';
import { useUIStore } from '@/store/uiStore';
import { useBranchStore } from '@/store/branchStore';

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
  dateFilter: 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'current-shift' | 'previous-shift';
  setDateFilter: (filter: 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'current-shift' | 'previous-shift') => void;
  activeBranchFilterId: string;
  setBranchFilter: (id: string) => void;
}

export function useDashboardData(): DashboardData {
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
  const [staticError, setStaticError] = useState<Error | null>(null);

  const { data: analyticsData, isLoading: isAnalyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useQuery({
    queryKey: ['dashboard-analytics', dashboardDateFilter, activeBranchFilterId],
    queryFn: () => api.getDashboardStats(dashboardDateFilter, activeBranchFilterId),
    refetchInterval: 15000,
  });

  const { data: todaysOrdersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['dashboard-todays-orders'],
    queryFn: api.getTodaysOrders,
    refetchInterval: 15000,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchStaticData() {
      try {
        setIsStaticLoading(true);
        // We will mock these for now as backend doesn't support them fully yet.
        setStaticData({
          reminder: { title: "Stock update", timeRange: "today", ctaLabel: "Review" },
          tasks: [],
          progress: { percent: 100, label: "Complete", segments: [] },
          user: { id: "1", name: "Admin", email: "admin@example.com", role: "SUPER_ADMIN" } as AdminUser,
        });
        setIsStaticLoading(false);
      } catch (err) {
        if (isMounted) {
          setStaticError(err instanceof Error ? err : new Error('Failed to load static dashboard data'));
          setIsStaticLoading(false);
        }
      }
    }
    fetchStaticData();
    return () => { isMounted = false; };
  }, []);

  const computedStats = useMemo<StatCardData[] | null>(() => {
    if (!analyticsData) return null;
    const {
      revenue, revGrowth,
      ordersCount, ordGrowth,
      averageOrderValue, aovGrowth,
      pendingOrders
    } = analyticsData;

    let trendLabel = 'vs previous period';
    switch (dashboardDateFilter) {
      case 'today': trendLabel = 'vs yesterday'; break;
      case 'yesterday': trendLabel = 'vs previous day'; break;
      case '7d': trendLabel = 'vs previous 7 days'; break;
      case '30d': trendLabel = 'vs previous 30 days'; break;
      case 'month': trendLabel = 'vs previous month'; break;
      case 'year': trendLabel = 'vs previous year'; break;
    }

    return [
      {
        id: 'today-revenue',
        title: "Total Revenue",
        value: `Rs. ${(revenue || 0).toLocaleString()}`,
        format: 'currency',
        trend: {
          direction: revGrowth >= 0 ? 'up' : 'down',
          percent: Math.abs(revGrowth || 0),
          label: trendLabel
        },
        variant: 'filled',
      },
      {
        id: 'today-orders',
        title: "Total Orders",
        value: ordersCount || 0,
        format: 'number',
        trend: {
          direction: ordGrowth >= 0 ? 'up' : 'down',
          percent: Math.abs(ordGrowth || 0),
          label: trendLabel
        },
        variant: 'white',
      },
      {
        id: 'avg-order-value',
        title: "Avg Order Value",
        value: `Rs. ${(averageOrderValue || 0).toLocaleString()}`,
        format: 'currency',
        trend: {
          direction: aovGrowth >= 0 ? 'up' : 'down',
          percent: Math.abs(aovGrowth || 0),
          label: trendLabel
        },
        variant: 'white',
      },
      {
        id: 'pending-orders',
        title: 'Pending Orders',
        value: pendingOrders || 0,
        format: 'number',
        trend: { direction: 'up', percent: 0, label: 'Needs attention' },
        variant: 'white',
        urgent: (pendingOrders || 0) > 0,
      },
    ];
  }, [analyticsData, dashboardDateFilter]);

  // Order Source Breakdown (Channel Share) - mocked or stubbed for now if backend doesn't supply it.
  const orderSources = useMemo(() => {
    if (!analyticsData?.channelBreakdown) {
      return {
        percent: 0,
        label: '',
        segments: [
          { label: 'Website', color: 'bg-accent-primary', value: 0 },
          { label: 'POS', color: 'bg-accent-light', value: 0 }
        ]
      };
    }
    const website = analyticsData.channelBreakdown.find((c: any) => c.name === 'WEBSITE')?.value || 0;
    const pos = analyticsData.channelBreakdown.find((c: any) => c.name === 'POS')?.value || 0;
    const total = website + pos || 1; // avoid division by zero
    const percent = Math.round((website / total) * 100);
    return {
      percent,
      label: '',
      segments: [
        { label: 'Website', color: 'bg-accent-primary', value: website },
        { label: 'POS', color: 'bg-accent-light', value: pos }
      ]
    };
  }, [analyticsData]);

  const paymentMethods = useMemo(() => {
    return analyticsData?.paymentMethodBreakdown || [];
  }, [analyticsData]);

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

  const branchPerformance = useMemo(() => {
    return analyticsData?.branchPerformance || [];
  }, [analyticsData]);

  const recentActivity = useMemo(() => {
    const list: RecentActivityItem[] = [];
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
    return list;
  }, [stockMovements, branches]);

  return {
    stats: computedStats,
    analytics: analyticsData?.revenueOverview || null,
    secondaryAnalytics: analyticsData?.ordersVolume || null,
    orderSources,
    paymentMethods,
    recentOrders: [],
    topProducts: analyticsData?.topProducts || null,
    lowStock,
    branchPerformance,
    recentActivity,
    orders: todaysOrdersData || [],
    reminder: staticData.reminder,
    tasks: staticData.tasks,
    progress: staticData.progress,
    user: staticData.user,
    isLoading: isAnalyticsLoading || isStaticLoading || isOrdersLoading,
    error: analyticsError || staticError,
    refetch: refetchAnalytics,
    dateFilter: dashboardDateFilter,
    setDateFilter: setDashboardDateFilter,
    activeBranchFilterId,
    setBranchFilter,
  };
}
