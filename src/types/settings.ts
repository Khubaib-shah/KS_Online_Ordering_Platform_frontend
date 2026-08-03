export interface OperatingHoursDay {
  day: string; // e.g. "Monday"
  openTime: string; // e.g. "10:00 AM"
  closeTime: string; // e.g. "11:00 PM"
  isClosed: boolean;
}

export type OperatingHours = OperatingHoursDay;

export interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  details?: {
    accountTitle?: string;
    accountNumber?: string;
  };
}

export interface DeliveryZone {
  id: string;
  name: string;
  deliveryFee: number;
  estimatedTime: string;
  isActive: boolean;
}

export interface RestaurantSettings {
  name: string;
  tagline?: string;
  phone: string;
  email: string;
  currency: string;
  logoUrl?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
  };
  operatingHours: OperatingHoursDay[];
  paymentGateways: PaymentGateway[];
  deliveryZones: DeliveryZone[];
}
