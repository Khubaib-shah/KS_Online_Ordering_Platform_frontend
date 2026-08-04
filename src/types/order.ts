export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  name: string;
  thumbnail?: string;
  variants?: string[]; // e.g. ["Size: Large", "Spice: Medium"]
  specialNote?: string;
  qty: number;
  unitPrice: number;
  total: number;
  selectedVariants?: any[];
  instructions?: string;
}

export interface OrderCustomer {
  id?: string; // empty if Guest
  name: string;
  avatarUrl?: string;
  phone: string;
  email?: string;
  isGuest?: boolean;
  orderCount?: number;
}

export interface OrderDelivery {
  type: 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN';
  addressLine1?: string;
  area?: string;
  city?: string;
  instructions?: string;
  estimatedTime?: string; // e.g., "30-45 min" or "12:45 PM"
  address?: string;
}

export interface OrderTimelineEvent {
  status: string;
  timestamp: string; // ISO string
  note?: string;
}

export interface OrderNote {
  id: string;
  author: string;
  timestamp: string; // ISO string
  text: string;
}

export interface Order {
  id?: string; // Optional or required depending on parser context
  orderNumber: string; // "INDOLJ-20260630-4827"
  customer: OrderCustomer;
  delivery: OrderDelivery;
  items: OrderItem[];
  subtotal: number;
  tax: number; // 15%
  deliveryFee: number;
  discount: number;
  promoCode?: string;
  grandTotal: number;
  paymentMethod: 'CASH' | 'COD' | 'CARD' | 'ONLINE' | 'WALLET' | 'BANK_TRANSFER' | 'LOYALTY_POINTS';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentReference?: string;
  status: OrderStatus;
  placedAt: string; // ISO string
  timeline: OrderTimelineEvent[];
  notes: OrderNote[];
  transactionId?: string;
  branchId?: string;
  branchName?: string;
  channel?: 'POS' | 'STOREFRONT' | string;
}

// For backwards compatibility with Prompt 4 order feeds
export interface OrderFeedItem {
  id: string;
  customerName: string;
  customerAvatarUrl?: string;
  orderSummary: string;
  total: number;
  status: OrderStatus;
  placedAt: string;
}
