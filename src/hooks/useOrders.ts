import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Order } from '../types/order';
import { ordersApi } from '../lib/api/orders.api';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';
import { useUIStore } from '../store/uiStore';

export function useOrders(params?: { page?: number; limit?: number; startDate?: string; endDate?: string; status?: string; branchId?: string; search?: string }) {
  const queryClient = useQueryClient();
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>({});

  const { isLoggedIn, isSuperAdmin } = useAuthStore();
  const { activeNavId } = useUIStore();
  const { activeBranchFilterId } = useBranchStore();

  const isSuperAdminContext = useMemo(() => {
    return isSuperAdmin && ['superadmin', 'restaurants-list', 'super-reports', 'super-escalations', 'super-cluster', 'super-plans', 'create-restaurant'].includes(activeNavId);
  }, [isSuperAdmin, activeNavId]);

  const { data: queryData, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
    enabled: isLoggedIn && !isSuperAdminContext,
    refetchInterval: 15000,
    placeholderData: (prev) => prev,
  });

  const orders = queryData?.data || [];
  const meta = queryData?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 };

  const updateStatus = async (orderIdentifier: string, status: Order['status']) => {
    const order = orders.find((o: Order) => o.orderNumber === orderIdentifier || o.id === orderIdentifier);
    if (!order) return;
    const targetId = order.id || order.orderNumber;

    if (updatingOrders[targetId]) return;
    setUpdatingOrders(prev => ({ ...prev, [targetId]: true }));
    try {
      const updated = await ordersApi.updateOrderStatus(targetId, status);
      queryClient.setQueriesData({ queryKey: ['orders'] }, (old: { data: Order[], meta: any } | undefined) => 
        old ? { ...old, data: old.data.map((o: Order) => o.id === targetId || o.orderNumber === orderIdentifier ? updated : o) } : old
      );
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const cancel = async (orderIdentifier: string, reason: string) => {
    const order = orders.find((o: Order) => o.orderNumber === orderIdentifier || o.id === orderIdentifier);
    if (!order) return;
    const targetId = order.id || order.orderNumber;

    if (updatingOrders[targetId]) return;
    setUpdatingOrders(prev => ({ ...prev, [targetId]: true }));
    try {
      const updated = await ordersApi.cancelOrder(targetId, reason);
      queryClient.setQueriesData({ queryKey: ['orders'] }, (old: { data: Order[], meta: any } | undefined) => 
        old ? { ...old, data: old.data.map((o: Order) => o.id === targetId || o.orderNumber === orderIdentifier ? updated : o) } : old
      );
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const addNote = async (orderIdentifier: string, author: string, text: string) => {
    const order = orders.find((o: Order) => o.orderNumber === orderIdentifier || o.id === orderIdentifier);
    if (!order) return;
    const targetId = order.id || order.orderNumber;

    if (updatingOrders[targetId]) return;
    setUpdatingOrders(prev => ({ ...prev, [targetId]: true }));
    try {
      const updated = await ordersApi.addOrderNote(targetId, author, text);
      queryClient.setQueriesData({ queryKey: ['orders'] }, (old: { data: Order[], meta: any } | undefined) => 
        old ? { ...old, data: old.data.map(o => o.id === targetId || o.orderNumber === orderIdentifier ? updated : o) } : old
      );
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const simulateNewOrderInList = (order: Order) => {
    const updatedOrder = ordersApi.simulateNewOrder(order);
    queryClient.setQueriesData({ queryKey: ['orders'] }, (old: { data: Order[], meta: any } | undefined) => 
      old ? { ...old, data: [updatedOrder, ...old.data] } : old
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
    meta,
    isLoading,
    isFetching,
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
