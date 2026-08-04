import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Order } from '../types/order';
import { ordersApi } from '../lib/api/orders.api';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';
import { useUIStore } from '../store/uiStore';

export function useOrders() {
  const queryClient = useQueryClient();
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>({});

  const { isLoggedIn, isSuperAdmin } = useAuthStore();
  const { activeNavId } = useUIStore();
  const { activeBranchFilterId } = useBranchStore();

  const isSuperAdminContext = useMemo(() => {
    return isSuperAdmin && ['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'super-plans', 'create-restaurant'].includes(activeNavId);
  }, [isSuperAdmin, activeNavId]);

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getOrders,
    enabled: isLoggedIn && !isSuperAdminContext,
    refetchInterval: 15000,
  });

  const updateStatus = async (orderNumber: string, status: Order['status']) => {
    if (updatingOrders[orderNumber]) return;
    setUpdatingOrders(prev => ({ ...prev, [orderNumber]: true }));
    try {
      const updated = await ordersApi.updateOrderStatus(orderNumber, status);
      queryClient.setQueryData(['orders'], (old: Order[] | undefined) => 
        old ? old.map(o => o.orderNumber === orderNumber ? updated : o) : []
      );
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
      queryClient.setQueryData(['orders'], (old: Order[] | undefined) => 
        old ? old.map(o => o.orderNumber === orderNumber ? updated : o) : []
      );
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
      queryClient.setQueryData(['orders'], (old: Order[] | undefined) => 
        old ? old.map(o => o.orderNumber === orderNumber ? updated : o) : []
      );
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
    queryClient.setQueryData(['orders'], (old: Order[] | undefined) => 
      old ? [updatedOrder, ...old] : [updatedOrder]
    );
  };

  const createOrder = async (payload: any) => {
    try {
      const created = await ordersApi.createOrder(payload);
      queryClient.setQueryData(['orders'], (old: Order[] | undefined) => 
        old ? [created, ...old] : [created]
      );
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (!activeBranchFilterId || activeBranchFilterId === 'all') return true;
      // If backend doesn't attach a branchId, default it to show so we don't orphan valid orders
      return o.branchId === activeBranchFilterId || !o.branchId || o.branchId === 'indolj-branch-1';
    });
  }, [orders, activeBranchFilterId]);

  return {
    orders: filteredOrders,
    allOrders: orders,
    isLoading,
    error,
    updatingOrders,
    refetch,
    updateStatus,
    cancel,
    addNote,
    simulateNewOrderInList,
    createOrder
  };
}
