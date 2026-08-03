import { Order } from '@/types/order';
import { AnalyticsDataPoint } from '@/types/dashboard';

export function getOrderDateRangeFilter(orderDate: Date, filter: string): boolean {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startOfYesterday = new Date(startOfToday.getTime());
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const endOfYesterday = new Date(startOfToday.getTime() - 1);

  if (filter === 'today') {
    return orderDate >= startOfToday;
  }
  if (filter === 'yesterday') {
    return orderDate >= startOfYesterday && orderDate <= endOfYesterday;
  }
  if (filter === '7d') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return orderDate >= sevenDaysAgo;
  }
  if (filter === '30d') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return orderDate >= thirtyDaysAgo;
  }
  if (filter === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return orderDate >= startOfMonth;
  }
  if (filter === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return orderDate >= startOfYear;
  }
  return true;
}

export function getOrderPreviousPeriodFilter(orderDate: Date, filter: string): boolean {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startOfYesterday = new Date(startOfToday.getTime());
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const dayBeforeYesterday = new Date(startOfYesterday.getTime());
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

  if (filter === 'today') {
    return orderDate >= startOfYesterday && orderDate < startOfToday;
  }
  if (filter === 'yesterday') {
    return orderDate >= dayBeforeYesterday && orderDate < startOfYesterday;
  }
  if (filter === '7d') {
    const startOfPrev = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const endOfPrev = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return orderDate >= startOfPrev && orderDate < endOfPrev;
  }
  if (filter === '30d') {
    const startOfPrev = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const endOfPrev = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return orderDate >= startOfPrev && orderDate < endOfPrev;
  }
  if (filter === 'month') {
    const startOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrev = new Date(now.getFullYear(), now.getMonth(), 1);
    return orderDate >= startOfPrev && orderDate < endOfPrev;
  }
  if (filter === 'year') {
    const startOfPrev = new Date(now.getFullYear() - 1, 0, 1);
    const endOfPrev = new Date(now.getFullYear(), 0, 1);
    return orderDate >= startOfPrev && orderDate < endOfPrev;
  }
  return false;
}

export function getAnalyticsPoints(orders: Order[], filter: string, metric: 'revenue' | 'orders'): AnalyticsDataPoint[] {
  const points: { label: string; value: number }[] = [];
  const now = new Date();

  if (filter === 'today' || filter === 'yesterday') {
    const labels = ['8AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM'];
    const values = [0, 0, 0, 0, 0, 0, 0];

    orders.forEach(o => {
      const date = new Date(o.placedAt);
      const hour = date.getHours();
      let slotIdx = 0;
      if (hour >= 8 && hour < 11) slotIdx = 0;
      else if (hour >= 11 && hour < 13) slotIdx = 1;
      else if (hour >= 13 && hour < 15) slotIdx = 2;
      else if (hour >= 15 && hour < 17) slotIdx = 3;
      else if (hour >= 17 && hour < 19) slotIdx = 4;
      else if (hour >= 19 && hour < 21) slotIdx = 5;
      else if (hour >= 21 || hour < 8) slotIdx = 6;

      const val = metric === 'revenue' ? (o.status !== 'CANCELLED' ? o.grandTotal : 0) : 1;
      values[slotIdx] += val;
    });

    for (let i = 0; i < 7; i++) {
      points.push({ label: labels[i], value: Math.round(values[i]) });
    }
  } else if (filter === '7d') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels: string[] = [];
    const values: number[] = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      labels.push(dayNames[d.getDay()]);
    }

    orders.forEach(o => {
      const orderDate = new Date(o.placedAt);
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 0 && diffDays < 7) {
        const idx = 6 - diffDays;
        const val = metric === 'revenue' ? (o.status !== 'CANCELLED' ? o.grandTotal : 0) : 1;
        values[idx] += val;
      }
    });

    for (let i = 0; i < 7; i++) {
      points.push({ label: labels[i], value: Math.round(values[i]) });
    }
  } else if (filter === '30d' || filter === 'month') {
    const labels = ['D1-4', 'D5-8', 'D9-12', 'D13-16', 'D17-20', 'D21-24', 'D25-30'];
    const values = [0, 0, 0, 0, 0, 0, 0];

    orders.forEach(o => {
      const orderDate = new Date(o.placedAt);
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 0 && diffDays < 30) {
        const bucketIdx = Math.min(6, Math.floor(diffDays / 4.3));
        const idx = 6 - bucketIdx;
        const val = metric === 'revenue' ? (o.status !== 'CANCELLED' ? o.grandTotal : 0) : 1;
        values[idx] += val;
      }
    });

    for (let i = 0; i < 7; i++) {
      points.push({ label: labels[i], value: Math.round(values[i]) });
    }
  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: string[] = [];
    const values = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      labels.push(monthNames[d.getMonth()]);
    }

    orders.forEach(o => {
      const orderDate = new Date(o.placedAt);
      const diffMonths = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth());
      if (diffMonths >= 0 && diffMonths < 7) {
        const idx = 6 - diffMonths;
        const val = metric === 'revenue' ? (o.status !== 'CANCELLED' ? o.grandTotal : 0) : 1;
        values[idx] += val;
      }
    });

    for (let i = 0; i < 7; i++) {
      points.push({ label: labels[i], value: Math.round(values[i]) });
    }
  }

  const maxRaw = Math.max(...points.map(p => p.value), 1);
  return points.map((p, idx) => {
    const displayVal = Math.round((p.value / maxRaw) * 80) + 15;
    let fillStyle: AnalyticsDataPoint['fillStyle'] = 'striped';
    if (idx === 5) fillStyle = 'solid-dark';
    else if (idx === 4 || idx === 3) fillStyle = 'solid-light';

    return {
      day: p.label,
      value: displayVal,
      fillStyle,
      highlightBadge: idx === 5 ? (metric === 'revenue' ? `Rs. ${p.value.toLocaleString()}` : `${p.value} orders`) : undefined
    };
  });
}
