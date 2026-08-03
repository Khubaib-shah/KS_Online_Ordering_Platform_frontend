import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types/order';
import { ordersApi } from '../lib/api/orders.api';

export function useOrderDetail(orderNumber: string | undefined) {
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderNumber) return;
    setIsLoading(true);
    try {
      const data = await ordersApi.getOrder(orderNumber);
      setOrder(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (status: Order['status']) => {
    if (!orderNumber) return;
    try {
      const updated = await ordersApi.updateOrderStatus(orderNumber, status);
      setOrder(updated);
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const cancelOrder = async (reason: string) => {
    if (!orderNumber) return;
    try {
      const updated = await ordersApi.cancelOrder(orderNumber, reason);
      setOrder(updated);
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addNote = async (author: string, text: string) => {
    if (!orderNumber) return;
    try {
      const updated = await ordersApi.addOrderNote(orderNumber, author, text);
      setOrder(updated);
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
    updateStatus,
    cancelOrder,
    addNote
  };
}
