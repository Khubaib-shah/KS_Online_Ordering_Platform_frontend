import { useState, useEffect, useCallback, useMemo } from 'react';
import { Order } from '../types/order';
import { ordersApi } from '../lib/api/orders.api';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';;

import { useUIStore } from '../store/uiStore';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>({});

  const { isLoggedIn, isSuperAdmin } = useAuthStore();
  const { activeNavId } = useUIStore();
  const { activeBranchFilterId } = useBranchStore();;

  const isSuperAdminContext = useMemo(() => {
    return isSuperAdmin && ['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'super-plans', 'create-restaurant'].includes(activeNavId);
  }, [isSuperAdmin, activeNavId]);

  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn || isSuperAdminContext) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, isSuperAdminContext]);

  useEffect(() => {
    if (!isLoggedIn || isSuperAdminContext) return;
    
    fetchOrders();

    // Set up polling interval for real-time updates (e.g., every 15 seconds)
    const intervalId = setInterval(() => {
      // Fetch silently without setting isLoading to true, to avoid flashing UI
      ordersApi.getOrders().then(data => {
        setOrders(data);
      }).catch(err => {
        console.error('Failed to poll orders:', err);
      });
    }, 15000);

    return () => clearInterval(intervalId);
  }, [fetchOrders, isLoggedIn, isSuperAdminContext]);

  const updateStatus = async (orderNumber: string, status: Order['status']) => {
    if (updatingOrders[orderNumber]) return;
    setUpdatingOrders(prev => ({ ...prev, [orderNumber]: true }));
    try {
      const updated = await ordersApi.updateOrderStatus(orderNumber, status);
      setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? updated : o));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [orderNumber]: false }));
    }
  };

  const cancel = async (orderNumber: string, reason: string) => {
    if (updatingOrders[orderNumber]) return;
    setUpdatingOrders(prev => ({ ...prev, [orderNumber]: true }));
    try {
      const updated = await ordersApi.cancelOrder(orderNumber, reason);
      setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? updated : o));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [orderNumber]: false }));
    }
  };

  const addNote = async (orderNumber: string, author: string, text: string) => {
    if (updatingOrders[orderNumber]) return;
    setUpdatingOrders(prev => ({ ...prev, [orderNumber]: true }));
    try {
      const updated = await ordersApi.addOrderNote(orderNumber, author, text);
      setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? updated : o));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [orderNumber]: false }));
    }
  };

  const simulateNewOrderInList = (order: Order) => {
    const updatedOrder = ordersApi.simulateNewOrder(order);
    setOrders(prev => [updatedOrder, ...prev]);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (!activeBranchFilterId || activeBranchFilterId === 'all') return true;
      return o.branchId === activeBranchFilterId;
    });
  }, [orders, activeBranchFilterId]);

  return {
    orders: filteredOrders,
    allOrders: orders,
    isLoading,
    error,
    updatingOrders,
    refetch: fetchOrders,
    updateStatus,
    cancel,
    addNote,
    simulateNewOrderInList
  };
}
