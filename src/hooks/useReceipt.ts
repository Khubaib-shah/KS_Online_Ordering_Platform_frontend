import { useState, useCallback, useEffect } from 'react';
import { Order } from '../types/order';
import { ordersApi } from '../lib/api/orders.api';
import { useUIStore } from '../store/uiStore';

export function useReceipt(orderNumber: string, initialOrder?: Order | null) {
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useUIStore();

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
    }
  }, [initialOrder]);

  const loadOrderDetails = useCallback(async () => {
    if (order) return; // If already loaded via props or state, don't fetch again
    setIsLoading(true);
    try {
      const fetchedOrder = await ordersApi.getOrder(orderNumber);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      } else {
        addToast('Receipt details could not be loaded from backend.', 'error');
      }
    } catch (err) {
      console.error('Failed to load order for printing receipt:', err);
      addToast('Error loading order receipt from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber, order, addToast]);

  return {
    order,
    isLoading,
    loadOrderDetails
  };
}
