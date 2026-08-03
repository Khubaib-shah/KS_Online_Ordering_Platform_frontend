import { StatCardData, AnalyticsDataPoint, ReminderData, ActionItem, ProgressData } from '@/types/dashboard';
import { OrderFeedItem } from '@/types/order';
import { AdminUser } from '@/types/user';
import { ordersApi } from '@/lib/api/orders.api';
import { getCurrentUser, isSuperAdmin } from '@/lib/security';


const MOCK_DELAY = 600;

export async function getDashboardStats(): Promise<StatCardData[]> {
  const orders = await ordersApi.getOrders();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = orders.filter(o => new Date(o.placedAt) >= today);
  const todaysRevenue = todaysOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.grandTotal, 0);

  return [
    {
      id: 'revenue',
      title: "Today's Revenue",
      value: todaysRevenue,
      format: 'currency',
      trend: { direction: 'up', percent: 0, label: 'vs yesterday' },
      variant: 'filled'
    },
    {
      id: 'orders',
      title: "Today's Orders",
      value: todaysOrders.length,
      format: 'number',
      trend: { direction: 'up', percent: 0, label: 'vs yesterday' },
      variant: 'white'
    },
    {
      id: 'avg_order',
      title: 'Avg Order Value',
      value: todaysOrders.length > 0 ? todaysRevenue / todaysOrders.length : 0,
      format: 'currency',
      trend: { direction: 'up', percent: 0, label: 'vs yesterday' },
      variant: 'white'
    }
  ];
}

export async function getWeeklyAnalytics(): Promise<AnalyticsDataPoint[]> {
  const orders = await ordersApi.getOrders();
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create last 7 days buckets
  const analytics: AnalyticsDataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    analytics.push({
      day: days[d.getDay()],
      value: 0,
      fillStyle: 'solid-light'
    });
  }

  // Populate
  orders.forEach(o => {
    if (o.status === 'CANCELLED') return;
    const od = new Date(o.placedAt);
    const diffTime = Math.abs(now.getTime() - od.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      const dayName = days[od.getDay()];
      const point = analytics.find(a => a.day === dayName);
      if (point) point.value += o.grandTotal;
    }
  });

  return analytics;
}

export async function getTodaysOrders(): Promise<OrderFeedItem[]> {
  const orders = await ordersApi.getOrders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = orders.filter(o => new Date(o.placedAt) >= today);

  return todaysOrders.map(o => ({
    id: o.orderNumber,
    customerName: o.customer.name,
    orderSummary: o.items.map(i => `${i.qty}x ${i.name}`).join(', '),
    total: o.grandTotal,
    status: o.status,
    placedAt: o.placedAt
  })).slice(0, 10); // Return recent 10
}

export async function getReminder(): Promise<ReminderData> {
  // Gap: Backend lacks reminder/tasks
  await new Promise((r) => setTimeout(r, MOCK_DELAY));
  return {
    title: 'No reminders',
    timeRange: '',
    ctaLabel: 'Dismiss'
  };
}

export async function getTasks(): Promise<ActionItem[]> {
  // Gap: Backend lacks action tasks
  await new Promise((r) => setTimeout(r, MOCK_DELAY));
  return [];
}

export async function getProgressData(): Promise<ProgressData> {
  // Gap: Backend lacks gamification progress
  await new Promise((r) => setTimeout(r, MOCK_DELAY));
  return {
    percent: 0,
    label: 'No data',
    segments: []
  };
}

export async function getUserProfile(): Promise<AdminUser | null> {
  // Gap: Should fetch from a unified /me endpoint if available.
  const user = getCurrentUser();
  if (user) {
    try {
      return {
        id: user.id,
        name: user.name,
        email: user.email || '',
        globalRole: isSuperAdmin(user) ? 'SUPER_ADMIN' : 'TENANT_USER',
        isActive: true,
        role: isSuperAdmin(user) ? 'SUPER_ADMIN' : 'ADMIN',
        avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
      };
    } catch { }
  }
  return null;
}
