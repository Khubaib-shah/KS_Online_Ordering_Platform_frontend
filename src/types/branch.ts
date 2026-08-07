export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  area: string;
  city: string;
  phone: string;
  whatsapp: string;
  mapsUrl?: string;
  status: 'active' | 'inactive';
}

export interface AreaMapping {
  area: string;
  branchId: string;
}

export interface InventoryItem {
  id: string;
  branchId: string;
  itemName: string;
  qty: number; // e.g. 20
  unit: string; // e.g. "kg" or "units"
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  branchId: string;
  itemName: string;
  type: 'in' | 'out';
  qty: number;
  reason: string;
  timestamp: string;
}
