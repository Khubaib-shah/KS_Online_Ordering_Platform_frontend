export interface DeliverySettings {
  deliveryFee: number;
  minOrderValue: number;
  estimatedDeliveryTime: number; // in minutes
  serviceableAreas: string[];
  pickupEnabled: boolean;
  pickupInstructions: string;
}
