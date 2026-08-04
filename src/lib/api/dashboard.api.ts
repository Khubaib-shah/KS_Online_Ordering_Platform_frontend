import { AnalyticsDataPoint, ReminderData, ActionItem, ProgressData } from '@/types/dashboard';
import { OrderFeedItem } from '@/types/order';
import { AdminUser } from '@/types/user';
import { apiClient } from '../api-client';
import { ordersApi } from './orders.api';
import { getCurrentUser, isSuperAdmin } from '../security';

const MOCK_DELAY = 800;

export async function getDashboardStats(filter: string, branchId?: string): Promise<any> {
  return apiClient.get('/analytics/dashboard', { params: { filter, branchId } });
}

export async function getWeeklyAnalytics(): Promise<AnalyticsDataPoint[]> {
  const { data: orders } = await ordersApi.getOrders();
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
  orders.forEach((o: OrderFeedItem | any) => {
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
  const { data: orders } = await ordersApi.getOrders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = orders.filter((o: OrderFeedItem | any) => new Date(o.placedAt) >= today);

  return todaysOrders.map((o: OrderFeedItem | any) => ({
    id: o.orderNumber,
    customerName: o.customer.name,
    orderSummary: o.items.map((i: any) => `${i.qty}x ${i.name}`).join(', '),
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
  const { data: orders } = await ordersApi.getOrders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = orders.filter((o: any) => new Date(o.placedAt) >= today && o.status !== 'CANCELLED');
  
  let dineIn = 0;
  let delivery = 0;
  let takeaway = 0;

  todaysOrders.forEach((o: any) => {
    if (o.delivery?.type === 'DINE_IN') dineIn++;
    else if (o.delivery?.type === 'DELIVERY') delivery++;
    else if (o.delivery?.type === 'TAKEAWAY') takeaway++;
  });

  const totalOrders = todaysOrders.length;
  const target = 50; // Target of 50 orders per day
  const percent = Math.min(Math.round((totalOrders / target) * 100), 100) || 0;

  return {
    percent,
    label: `Daily Target (${totalOrders}/${target})`,
    segments: [
      { label: 'Dine-in', color: 'var(--color-accent-primary)', value: dineIn },
      { label: 'Delivery', color: 'var(--color-accent-light)', value: delivery },
      { label: 'Takeaway', color: 'var(--color-accent-dark)', value: takeaway }
    ]
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
