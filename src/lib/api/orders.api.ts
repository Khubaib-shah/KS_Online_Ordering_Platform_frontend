import { Order } from '../../types/order';
import { apiClient } from '../api-client';

const mapBackendOrderToFrontend = (backendOrder: any): Order => {
  return {
    id: backendOrder.id,
    orderNumber: backendOrder.orderNumber,
    customer: {
      name: backendOrder.customer?.name || backendOrder.customerName || 'Guest',
      phone: backendOrder.customer?.phone || backendOrder.customerPhone || 'N/A',
      isGuest: !backendOrder.customerId,
    },
    delivery: {
      type: backendOrder.fulfillmentType,
      address: backendOrder.delivery?.address || backendOrder.deliveryAddress || backendOrder.delivery_address || backendOrder.address || backendOrder.addressLine1 || backendOrder.delivery?.addressLine1 || '',
      instructions: backendOrder.deliveryInstructions || backendOrder.delivery_instructions || '',
    },
    items: backendOrder.items?.map((item: any) => ({
      id: item.id,
      name: item.itemName,
      qty: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.totalPrice),
      specialNote: item.itemNote || '',
    })) || [],
    subtotal: Number(backendOrder.subtotal),
    tax: Number(backendOrder.taxAmount),
    deliveryFee: Number(backendOrder.deliveryFee),
    discount: Number(backendOrder.discountAmount),
    grandTotal: Number(backendOrder.grandTotal),
    paymentMethod: backendOrder.paymentMethod,
    paymentStatus: backendOrder.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID',
    status: backendOrder.status,
    placedAt: backendOrder.createdAt || backendOrder.placedAt || new Date().toISOString(),
    timeline: Array.isArray(backendOrder.statusTimeline)
      ? backendOrder.statusTimeline
      : [{ status: backendOrder.status, timestamp: backendOrder.createdAt || backendOrder.placedAt || new Date().toISOString(), note: 'Order placed' }],
    notes: (backendOrder.privateKitchenNotes || backendOrder.private_kitchen_notes)
      ? [{ id: '1', author: 'System', timestamp: backendOrder.createdAt || new Date().toISOString(), text: backendOrder.privateKitchenNotes || backendOrder.private_kitchen_notes }]
      : [],
    branchId: String(backendOrder.branchId || backendOrder.branch_id || ''),
    channel: backendOrder.channel || backendOrder.source || (backendOrder.fulfillmentType === 'DELIVERY' ? 'STOREFRONT' : 'POS'),
  };
};

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    // The backend uses pagination, we fetch limit=100 for now to mimic the full list in UI
    const res = await apiClient.get('/orders?limit=100');
    return Array.isArray(res) ? res.map(mapBackendOrderToFrontend) : [];
  },

  getOrder: async (idOrOrderNumber: string): Promise<Order | undefined> => {
    try {
      // In our mock, orderNumber was used to fetch. In real backend, /orders/:id expects UUID.
      // But if the UI passes orderNumber, this might fail unless backend accepts it.
      // We will try fetching the list and filtering if needed, or if it's an ID, just fetch directly.
      const res = await apiClient.get(`/orders/${idOrOrderNumber}`);
      return mapBackendOrderToFrontend(res);
    } catch (e) {
      console.error("Failed to get order", e);
      return undefined;
    }
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const res = await apiClient.patch(`/orders/${id}/status`, { status });
    return mapBackendOrderToFrontend(res);
  },

  cancelOrder: async (id: string, reason: string): Promise<Order> => {
    const res = await apiClient.patch(`/orders/${id}/status`, { status: 'CANCELLED', notes: reason });
    return mapBackendOrderToFrontend(res);
  },

  addOrderNote: async (id: string, author: string, text: string): Promise<Order> => {
    // Backend doesn't have an addOrderNote endpoint yet.
    // We mock the return by fetching and appending locally or logging.
    console.warn("Backend does not support adding notes yet. Stubbing local return.");
    const order = await ordersApi.getOrder(id);
    if (order) {
      order.notes.unshift({ id: `note-${Date.now()}`, author, timestamp: new Date().toISOString(), text });
      return order;
    }
    throw new Error('Order not found');
  },

  simulateNewOrder: (order: Order) => {
    // Left for UI demo purposes if they still use random quick sales.
    // Will not sync to backend since it's a simulation.
    console.warn("Simulate new order called. This is a local mock action.");
    return order;
  },

  createOrder: async (payload: any): Promise<Order> => {
    const res = await apiClient.post('/pos/orders', payload);
    return mapBackendOrderToFrontend(res);
  }
};
