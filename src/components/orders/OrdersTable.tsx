import React, { useState, useMemo } from 'react';
import { Trash2, CheckCircle, Printer, Loader2 } from 'lucide-react';

import { ColumnDef } from '@tanstack/react-table';
import { useOrders } from '@/hooks/useOrders';
import { ordersApi } from '@/lib/api/orders.api';
import { useUIStore } from '@/store/uiStore';
import { Order } from '@/types/order';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { OrderStatusDropdown } from '@/components/orders/OrderStatusDropdown';
import { ReceiptModal } from '@/components/pos/components/ReceiptModal';

interface OrdersTableProps {
  onRowClick: (order: Order) => void;
}


export function OrdersTable({
  onRowClick,
}: OrdersTableProps) {
  const { addToast } = useUIStore();

  // Server-side Filtering & Pagination states
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // Not supported by backend natively, maybe drop or handle?
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState<string | null>(null);

  const handlePrintClick = async (e: React.MouseEvent, orderId: string | undefined) => {
    e.stopPropagation();
    if (!orderId) {
      addToast('Order ID is missing', 'error');
      return;
    }
    setIsReceiptLoading(orderId);
    try {
      const fullOrder = await ordersApi.getOrder(orderId);
      if (fullOrder) {
        setSelectedOrderForReceipt(fullOrder);
      } else {
        addToast('Failed to load full order details', 'error');
      }
    } catch (err) {
      addToast('Error fetching order details', 'error');
    } finally {
      setIsReceiptLoading(null);
    }
  };

  // Fetch paginated orders
  const { orders, meta, isLoading, updateStatus } = useOrders({
    page,
    limit,
    search: searchValue || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    // Add other filters as supported by the backend
  });

  // Table Columns Definition
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary cursor-pointer accent-[#0E4B3E]"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary cursor-pointer accent-[#0E4B3E] no-row-click"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'orderNumber',
        header: 'Order #',
        cell: ({ row }) => {
          const val = row.getValue('orderNumber') as string;
          return (
            <span className="font-mono font-bold text-xs text-text-primary hover:text-accent-primary transition-colors">
              {val.split('-').pop()}
            </span>
          );
        },
      },
      {
        accessorKey: 'placedAt',
        header: 'Date & Time',
        cell: ({ row }) => {
          const val = row.getValue('placedAt') as string;
          const d = new Date(val);
          return (
            <div className="flex flex-col select-none">
              <span className="text-sm font-semibold text-text-primary">
                {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[11px] text-text-secondary/65 mt-0.5">
                {d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => {
          const cust = row.original.customer;
          return (
            <div className="flex flex-col select-none">
              <span className="text-sm font-bold text-text-primary line-clamp-1">{cust.name}</span>
              <span className="text-xs text-text-secondary mt-0.5">{cust.phone}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'delivery',
        header: 'Type',
        cell: ({ row }) => {
          const del = row.original.delivery;
          const type = del.type;
          return (
            <div className="flex flex-col select-none">
              <span className={`text-xs font-bold uppercase tracking-wider ${type === 'DELIVERY' ? 'text-accent-primary' : 'text-accent-dark'}`}>
                {type}
              </span>
              {type === 'DELIVERY' && del.area && (
                <span className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">{del.area}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'grandTotal',
        header: 'Grand Total',
        cell: ({ row }) => {
          const val = row.getValue('grandTotal') as number;
          return (
            <span className="font-poppins font-bold text-sm text-text-primary">
              Rs. {val.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => {
          const status = row.original.paymentStatus;
          const method = row.original.paymentMethod;
          return (
            <div className="flex flex-col select-none">
              <span className={`inline-flex items-center text-[10px] font-bold uppercase ${status === 'PAID' ? 'text-accent-primary' : 'text-[#CA8A04]'}`}>
                ● {status}
              </span>
              <span className="text-[11px] text-text-secondary capitalize mt-0.5">{method}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Order Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as Order['status'];
          return (
            <OrderStatusDropdown
              currentStatus={status}
              onStatusChange={(nextStatus) => updateStatus(row.original.orderNumber, nextStatus)}
            />
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <Button variant="custom" size="none" onClick={(e) => handlePrintClick(e, row.original.id)}
            disabled={isReceiptLoading === row.original.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-text-primary bg-white hover:bg-slate-50 border border-border-subtle rounded-xl hover:border-slate-300 transition-all shadow-sm active:scale-95 cursor-pointer select-none no-row-click focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {isReceiptLoading === row.original.id ? (
              <Loader2 size={13} className="animate-spin text-slate-500" />
            ) : (
              <Printer size={13} className="text-slate-500 group-hover:text-text-primary" />
            )}
            <span>Print Receipt</span>
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [updateStatus]
  );

  // The filteredOrders is now just the orders returned from the backend
  const filteredOrders = orders;

  const hasActiveFilters =
    searchValue !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all';

  const handleClearFilters = () => {
    setSearchValue('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  // Since server does pagination, we don't have accurate full counts for tabs unless returned by meta.
  // Assuming a generic map for now
  const statusCounts = useMemo((): Record<string, number | string> => {
    if (meta && (meta as any).statusCounts) {
      const serverCounts = (meta as any).statusCounts;
      return {
        all: serverCounts.all || 0,
        pending: serverCounts.pending || 0,
        confirmed: serverCounts.confirmed || 0,
        preparing: serverCounts.preparing || 0,
        out_for_delivery: serverCounts.out_for_delivery || 0,
        delivered: serverCounts.delivered || 0,
        cancelled: serverCounts.cancelled || 0,
      };
    }
    const counts: Record<string, number | string> = {
      all: 'All',
      pending: '?',
      confirmed: '?',
      preparing: '?',
      out_for_delivery: '?',
      delivered: '?',
      cancelled: '?',
    };
    return counts;
  }, [meta]);

  const tabs: { id: string; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="w-full flex flex-col animate-fade-in select-none">
      {/* Horizontal Status Toggle Bar */}
      <div className="flex border-b border-border-subtle/50 mb-6 overflow-x-auto scrollbar-none pr-4">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          const count = statusCounts[tab.id];

          return (
            <Button variant="custom" size="none" key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`
                relative px-5 py-4 text-xs sm:text-sm font-semibold font-poppins transition-all shrink-0 cursor-pointer border-b-2 rounded-none
                ${isActive
                  ? 'border-accent-primary text-accent-dark'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <span>{tab.label}</span>
              <span className={`ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-accent-primary text-white' : 'bg-slate-100 text-text-secondary'}`}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Main Table Filters Toolbar */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={(val) => { setSearchValue(val); setPage(1); }}
        searchPlaceholder="Search order number, client name or items..."
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        filters={
          <div className="flex items-center gap-2.5">
            {/* Delivery Type select */}
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="font-semibold text-text-primary bg-white border border-border-subtle rounded-xl px-4 focus:outline-none focus:border-accent-primary cursor-pointer transition-all shadow-sm"
            >
              <option value="all">All Service Types</option>
              <option value="Delivery">Delivery</option>
              <option value="Pickup">Pickup</option>
            </Select>

            {/* Removed date pickers and payment filters as they require backend support for pagination */}
          </div>
        }
      />

      {/* TanStack DataTable wrapper */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        isLoading={isLoading}
        onRowClick={onRowClick}
        emptyMessage="No orders found matching your search and filters."
        onClearFilters={handleClearFilters}
        manualPagination={true}
        pageCount={meta?.totalPages || 1}
        pagination={{ pageIndex: page - 1, pageSize: limit }}
        onPaginationChange={(updater) => {
          if (typeof updater === 'function') {
            const nextState = updater({ pageIndex: page - 1, pageSize: limit });
            setPage(nextState.pageIndex + 1);
            setLimit(nextState.pageSize);
          } else {
            setPage(updater.pageIndex + 1);
            setLimit(updater.pageSize);
          }
        }}
        bulkActions={
          <div className="flex items-center gap-2">
            <Button variant="custom" size="none" className="hidden" />
            <span className="text-xs font-semibold text-text-secondary mr-1">Bulk Edit:</span>
            <Button variant="custom" size="none" onClick={() => { }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0E4B3E] bg-[#0E4B3E]/10 rounded-full hover:bg-[#0E4B3E]/20 transition-all cursor-pointer border border-[#0E4B3E]/15"
            >
              <CheckCircle size={13} />
              Advance Status
            </Button>
            <Button variant="custom" size="none" onClick={() => { }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-all cursor-pointer border border-red-200"
            >
              <Trash2 size={13} />
              Cancel Selected
            </Button>
          </div>
        }
      />

      <ReceiptModal
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        order={selectedOrderForReceipt}
      />
    </div>
  );
}
