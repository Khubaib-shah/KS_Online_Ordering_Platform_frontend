import { ReportsData, BestSellerItem, WorstSellerItem, DiscountImpactItem } from '@/types/report';
import { ordersApi } from './orders.api';
import { menuApi } from './menu.api';
import { customersApi } from './customers.api';

export function aggregateReportsData(sourceOrders: any[], sourceMenuItems: any[]): ReportsData {
  // Filter out cancelled orders for revenue statistics, as they don't count towards sales
  const successfulOrders = sourceOrders.filter(o => o.status !== 'cancelled' && o.status !== 'CANCELLED');
  
  // Calculate Summary metrics
  const revenue = successfulOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const ordersCount = successfulOrders.length;
  const avgOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;

  const revenueDelta = 14.8;
  const ordersDelta = 11.2;
  const avgOrderValueDelta = 3.2;

  // Compute daily trends for the last 30 days
  const dailyRevMap = new Map<string, number>();
  const dailyOrdMap = new Map<string, number>();

  successfulOrders.forEach(o => {
    if (!o.placedAt) return;
    const d = new Date(o.placedAt);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    dailyRevMap.set(dateStr, (dailyRevMap.get(dateStr) || 0) + (o.grandTotal || 0));
    dailyOrdMap.set(dateStr, (dailyOrdMap.get(dateStr) || 0) + 1);
  });

  const sortedDates = Array.from(dailyRevMap.keys()).sort((a, b) => {
    const [am, ad] = a.split('/').map(Number);
    const [bm, bd] = b.split('/').map(Number);
    return am === bm ? ad - bd : am - bm;
  }).slice(-30);

  const revenueTrend = sortedDates.map(date => ({
    date,
    value: Math.round(dailyRevMap.get(date) || 0)
  }));

  const ordersTrend = sortedDates.map(date => ({
    date,
    value: dailyOrdMap.get(date) || 0
  }));

  let deliveryCount = 0;
  let pickupCount = 0;
  successfulOrders.forEach(o => {
    if (o.delivery?.type?.toLowerCase() === 'delivery') deliveryCount++;
    else pickupCount++;
  });

  const orderTypeBreakdown = [
    { name: 'Delivery', value: deliveryCount },
    { name: 'Pickup', value: pickupCount }
  ];

  const pmMap = new Map<string, number>();
  successfulOrders.forEach(o => {
    if (o.paymentMethod) {
      pmMap.set(o.paymentMethod, (pmMap.get(o.paymentMethod) || 0) + 1);
    }
  });
  const paymentMethodBreakdown = Array.from(pmMap.entries()).map(([name, value]) => ({ name, value }));

  const hourlyMap = Array(24).fill(0);
  successfulOrders.forEach(o => {
    if (!o.placedAt) return;
    const hour = new Date(o.placedAt).getHours();
    hourlyMap[hour] += o.grandTotal || 0;
  });
  const hourlyRevenue = hourlyMap.map((val, hour) => ({
    date: `${hour.toString().padStart(2, '0')}:00`,
    value: Math.round(val)
  }));

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayMap = Array(7).fill(0);
  successfulOrders.forEach(o => {
    if (!o.placedAt) return;
    const day = new Date(o.placedAt).getDay();
    weekdayMap[day] += o.grandTotal || 0;
  });
  const weekdayRevenue = weekdayMap.map((val, idx) => ({
    date: weekdayNames[idx],
    value: Math.round(val)
  }));

  const itemSoldMap = new Map<string, { qty: number; revenue: number }>();
  successfulOrders.forEach(o => {
    if (!o.items) return;
    o.items.forEach((item: any) => {
      const existing = itemSoldMap.get(item.name) || { qty: 0, revenue: 0 };
      itemSoldMap.set(item.name, {
        qty: existing.qty + item.qty,
        revenue: existing.revenue + item.total
      });
    });
  });

  const bestSellers: BestSellerItem[] = [];
  const worstSellers: WorstSellerItem[] = [];

  sourceMenuItems.forEach(item => {
    const soldData = itemSoldMap.get(item.name) || { qty: 0, revenue: 0 };
    const sellerItem = {
      id: item.id,
      name: item.name,
      thumbnail: undefined,
      category: item.category,
      unitsSold: soldData.qty,
      revenue: soldData.revenue
    };
    bestSellers.push(sellerItem);
    worstSellers.push(sellerItem);
  });

  bestSellers.sort((a, b) => b.unitsSold - a.unitsSold);
  const finalBestSellers = bestSellers.slice(0, 10);

  worstSellers.sort((a, b) => a.unitsSold - b.unitsSold);
  const finalWorstSellers = worstSellers.slice(0, 10);

  const catMap = new Map<string, number>();
  successfulOrders.forEach(o => {
    if (!o.items) return;
    o.items.forEach((item: any) => {
      const menuItem = sourceMenuItems.find(m => m.name === item.name);
      const cat = menuItem?.category || 'General';
      catMap.set(cat, (catMap.get(cat) || 0) + item.total);
    });
  });
  const categoryPerformance = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  let returningCustCount = 0;
  let newCustCount = 0;
  
  const uniqueCustIds = new Set<string>();
  successfulOrders.forEach(o => {
    if (o.customer && o.customer.id) {
      uniqueCustIds.add(o.customer.id);
    }
  });

  uniqueCustIds.forEach(id => {
    const oCount = sourceOrders.filter(o => o.customer?.id === id).length;
    if (oCount > 1) returningCustCount++;
    else newCustCount++;
  });

  const newVsReturning = [
    { name: 'New Customers', value: newCustCount },
    { name: 'Returning Customers', value: returningCustCount }
  ];

  const topCustMap = new Map<string, { name: string; spent: number; orders: number }>();
  successfulOrders.forEach(o => {
    if (o.customer && o.customer.id) {
      const existing = topCustMap.get(o.customer.id) || { name: o.customer.name, spent: 0, orders: 0 };
      topCustMap.set(o.customer.id, {
        name: o.customer.name,
        spent: existing.spent + (o.grandTotal || 0),
        orders: existing.orders + 1
      });
    }
  });
  const topCustomers = Array.from(topCustMap.entries())
    .map(([id, data], idx) => ({
      rank: idx + 1,
      id,
      name: data.name,
      orders: data.orders,
      spent: Math.round(data.spent)
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 10)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const discountImpact: DiscountImpactItem[] = [];
  sourceMenuItems.forEach(item => {
    if (item.basePrice > item.discountPrice) {
      const soldData = itemSoldMap.get(item.name) || { qty: 0, revenue: 0 };
      if (soldData.qty > 0) {
        const discountAmt = item.basePrice - item.discountPrice;
        discountImpact.push({
          id: item.id,
          name: item.name,
          originalPrice: item.basePrice,
          discountPrice: item.discountPrice,
          discountPercent: Math.round((discountAmt / item.basePrice) * 100),
          unitsSold: soldData.qty,
          totalDiscountGiven: discountAmt * soldData.qty
        });
      }
    }
  });
  discountImpact.sort((a, b) => b.totalDiscountGiven - a.totalDiscountGiven);

  const channelMap = new Map<string, number>();
  successfulOrders.forEach(o => {
    const channelName = o.channel === 'WEBSITE' ? 'Online' : o.channel === 'POS' ? 'POS' : o.channel || 'Other';
    channelMap.set(channelName, (channelMap.get(channelName) || 0) + (o.grandTotal || 0));
  });
  const channelBreakdown = Array.from(channelMap.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));

  return {
    summary: {
      revenue: Math.round(revenue),
      revenueDelta,
      ordersCount,
      ordersDelta,
      avgOrderValue: Math.round(avgOrderValue),
      avgOrderValueDelta
    },
    revenueTrend,
    ordersTrend,
    orderTypeBreakdown,
    channelBreakdown,
    paymentMethodBreakdown,
    hourlyRevenue,
    weekdayRevenue,
    bestSellers: finalBestSellers,
    worstSellers: finalWorstSellers,
    categoryPerformance,
    newVsReturning,
    topCustomers,
    discountImpact
  };
}

export const reportsApi = {
  getReports: async (branchId?: string, dateRange: string = '30d', customStart?: string, customEnd?: string): Promise<ReportsData> => {
    let startDate: string | undefined;
    let endDate: string | undefined;
    const now = new Date();
    
    if (dateRange === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      startDate = d.toISOString();
    } else if (dateRange === 'yesterday') {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      startDate = start.toISOString();
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      endDate = end.toISOString();
    } else if (dateRange === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString();
    } else if (dateRange === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString();
    } else if (dateRange === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = d.toISOString();
    } else if (dateRange === 'custom') {
      if (customStart) startDate = new Date(customStart).toISOString();
      if (customEnd) {
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        endDate = end.toISOString();
      }
    }

    const { data: allOrders } = await ordersApi.getOrders({ limit: 100000, startDate, endDate });
    const allItems = await menuApi.getMenuItems();
    const filteredOrders = !branchId || branchId === 'all'
      ? allOrders
      : allOrders.filter((o: any) => o.branchId === branchId);
    return aggregateReportsData(filteredOrders, allItems);
  },

  exportToCsv: async (type: 'orders' | 'items' | 'customers' | 'all', dateRange?: string, customStart?: string, customEnd?: string): Promise<boolean> => {
    let csvContent = '';
    
    let tenantName = 'indolj';
    try {
      const storedTenants = localStorage.getItem('KS_active_tenant_id') || localStorage.getItem('indolj_active_tenant_id');
      const allTenantsStr = localStorage.getItem('KS_tenants') || localStorage.getItem('indolj_tenants');
      if (storedTenants && allTenantsStr) {
        const allTenants = JSON.parse(allTenantsStr);
        const activeTenant = allTenants.find((t: any) => t.id === storedTenants);
        if (activeTenant && activeTenant.name) {
          tenantName = activeTenant.name.replace(/\s+/g, '-').toLowerCase();
        }
      }
    } catch (e) {
      console.error('Failed to get tenant name for export', e);
    }

    let filename = `${tenantName}-${type}-export-${new Date().toISOString().slice(0, 10)}.csv`;

    let startDate: string | undefined;
    let endDate: string | undefined;
    if (dateRange === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      startDate = d.toISOString();
    } else if (dateRange === 'yesterday') {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      startDate = start.toISOString();
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      endDate = end.toISOString();
    } else if (dateRange === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString();
    } else if (dateRange === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString();
    } else if (dateRange === 'month') {
      const now = new Date();
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = d.toISOString();
    } else if (dateRange === 'custom') {
      if (customStart) startDate = new Date(customStart).toISOString();
      if (customEnd) {
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        endDate = end.toISOString();
      }
    }

    if (type === 'orders') {
      const { data: orders } = await ordersApi.getOrders({ limit: 100000, startDate, endDate });
      const headers = ['Order Number', 'Customer Name', 'Customer Phone', 'Order Type', 'Subtotal', 'Tax', 'Delivery Fee', 'Discount', 'Grand Total', 'Payment Method', 'Payment Status', 'Order Status', 'Placed At'];
      csvContent += headers.join(',') + '\n';

      orders.forEach((o: any) => {
        const row = [
          o.orderNumber,
          `"${o.customer.name.replace(/"/g, '""')}"`,
          o.customer.phone,
          o.delivery.type,
          o.subtotal,
          o.tax,
          o.deliveryFee,
          o.discount,
          o.grandTotal,
          o.paymentMethod,
          o.paymentStatus,
          o.status,
          o.placedAt
        ];
        csvContent += row.join(',') + '\n';
      });
    } else if (type === 'items') {
      const items = await menuApi.getMenuItems();
      const headers = ['Item ID', 'Name', 'Category', 'Base Price', 'Discount Price', 'Badge', 'Featured', 'Available', 'Sort Order'];
      csvContent += headers.join(',') + '\n';

      items.forEach(i => {
        const row = [
          i.id,
          `"${i.name.replace(/"/g, '""')}"`,
          `"${i.category.replace(/"/g, '""')}"`,
          i.basePrice,
          i.discountPrice,
          i.badge || 'None',
          i.isFeatured ? 'Yes' : 'No',
          i.isAvailable ? 'Yes' : 'No',
          i.sortOrder
        ];
        csvContent += row.join(',') + '\n';
      });
    } else if (type === 'customers') {
      const customers = await customersApi.getCustomers();
      const headers = ['Customer ID', 'Name', 'Phone', 'Email', 'Joined Date', 'Total Orders', 'Total Spent', 'Average Order Value', 'Last Order Date'];
      csvContent += headers.join(',') + '\n';

      customers.forEach(c => {
        const row = [
          c.id,
          `"${c.name.replace(/"/g, '""')}"`,
          c.phone,
          c.email || '',
          c.joinedDate,
          c.totalOrders,
          c.totalSpent,
          c.avgOrderValue,
          c.lastOrderDate
        ];
        csvContent += row.join(',') + '\n';
      });
    } else {
      const { data: orders } = await ordersApi.getOrders({ limit: 100000, startDate });
      const items = await menuApi.getMenuItems();
      const customers = await customersApi.getCustomers();

      csvContent += 'Overall Metrics Export\n';
      csvContent += `Generated At,${new Date().toISOString()}\n\n`;
      csvContent += `Total Completed Orders,${orders.filter((o: any) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length}\n`;
      csvContent += `Total Customers,${customers.length}\n`;
      csvContent += `Total Active Menu Items,${items.filter(i => i.isAvailable).length}\n`;
      csvContent += `Total Revenue (Rs.),${orders.filter((o: any) => o.status !== 'CANCELLED').reduce((sum: number, o: any) => sum + o.grandTotal, 0)}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }
};
