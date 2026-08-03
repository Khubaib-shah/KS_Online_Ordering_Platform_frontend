export interface SavedAddress {
  id: string;
  label: string; // e.g., "Home", "Office"
  addressLine1: string;
  area: string;
  city: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  email?: string;
  joinedDate: string; // ISO date string
  isReturning: boolean;
  totalSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  lastOrderDate: string; // ISO date string
  addresses: SavedAddress[];
  notes: { id: string; author: string; timestamp: string; text: string }[];
}
