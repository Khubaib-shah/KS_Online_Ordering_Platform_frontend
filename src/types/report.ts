export interface SalesReportSummary {
  revenue: number;
  revenueDelta: number; // e.g. 12.5%
  ordersCount: number;
  ordersDelta: number;
  avgOrderValue: number;
  avgOrderValueDelta: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface BreakdownPoint {
  name: string;
  value: number;
}

export interface BestSellerItem {
  id: string;
  name: string;
  thumbnail?: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface WorstSellerItem {
  id: string;
  name: string;
  thumbnail?: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface DiscountImpactItem {
  id: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  unitsSold: number;
  totalDiscountGiven: number;
}

export interface ReportsData {
  summary: SalesReportSummary;
  revenueTrend: ChartDataPoint[];
  ordersTrend: ChartDataPoint[];
  orderTypeBreakdown: BreakdownPoint[]; // Delivery vs Pickup
  channelBreakdown: BreakdownPoint[]; // POS vs Website
  paymentMethodBreakdown: BreakdownPoint[]; // COD / Card / JazzCash / EasyPaisa
  hourlyRevenue: ChartDataPoint[]; // 24 hours
  weekdayRevenue: ChartDataPoint[]; // 7 days
  bestSellers: BestSellerItem[];
  worstSellers: WorstSellerItem[];
  categoryPerformance: BreakdownPoint[];
  newVsReturning: BreakdownPoint[];
  topCustomers: { rank: number; id: string; name: string; orders: number; spent: number }[];
  discountImpact: DiscountImpactItem[];
}
