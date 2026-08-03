import { Select } from '../ui/Select'; import { Button } from '@/components/ui/Button';

import React, { useState, useMemo } from 'react';
import { Input } from '../ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { Order } from '../../types/order';
import { DataTable } from '../data-table/DataTable';
import { DataTableToolbar } from '../data-table/DataTableToolbar';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusDropdown } from './OrderStatusDropdown';
import { PrintReceiptButton } from './PrintReceiptButton';
import { DatePicker } from '../ui/DatePicker';
import { format } from 'date-fns';
import { Calendar, Search, SlidersHorizontal, Trash2, CheckCircle, Package } from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onStatusChange: (orderNumber: string, status: Order['status']) => Promise<any>;
  onRowClick: (order: Order) => void;
  onBulkAdvance: (orderNumbers: string[]) => void;
  onBulkCancel: (orderNumbers: string[]) => void;
}

export function OrdersTable({
  orders,
  isLoading,
  onStatusChange,
  onRowClick,
  onBulkAdvance,
  onBulkCancel,
}: OrdersTableProps) {
  // Local Filtering states
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
              onStatusChange={(nextStatus) => onStatusChange(row.original.orderNumber, nextStatus)}
            />
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <PrintReceiptButton orderNumber={row.original.orderNumber} order={row.original} />,
        enableSorting: false,
      },
    ],
    [onStatusChange]
  );

  // Apply sequential client-side filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search filter
      const searchLower = searchValue.toLowerCase();
      const matchSearch =
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.phone.includes(searchLower) ||
        order.items.some((it) => it.name.toLowerCase().includes(searchLower));

      if (!matchSearch) return false;

      // 2. Status Tab Filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;

      // 3. Delivery Type Filter
      if (typeFilter !== 'all' && order.delivery.type !== typeFilter) return false;

      // 4. Payment Method Filter
      if (paymentFilter !== 'all' && order.paymentMethod !== paymentFilter) return false;

      // 5. Date Range Filters
      if (startDate) {
        const start = new Date(startDate).getTime();
        const placed = new Date(order.placedAt).getTime();
        if (placed < start) return false;
      }
      if (endDate) {
        // Adjust end date to the end of that day (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const placed = new Date(order.placedAt).getTime();
        if (placed > end.getTime()) return false;
      }

      return true;
    });
  }, [orders, searchValue, statusFilter, typeFilter, paymentFilter, startDate, endDate]);

  const hasActiveFilters =
    searchValue !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    paymentFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '';

  const handleClearFilters = () => {
    setSearchValue('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPaymentFilter('all');
    setStartDate('');
    setEndDate('');
  };

  // Status Tab Counts Helper
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

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
              onClick={() => setStatusFilter(tab.id)}
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
        onSearchChange={setSearchValue}
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

            {/* Payment Method select */}
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="font-semibold text-text-primary bg-white border border-border-subtle rounded-xl px-4 focus:outline-none focus:border-accent-primary cursor-pointer transition-all shadow-sm"
            >
              <option value="all">All Payments</option>
              <option value="cash_on_delivery">Cash on Delivery (COD)</option>
              <option value="card">Credit/Debit Card</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
            </Select>

            {/* Date Picker */}
            <div className="w-60 shrink-0">
              <DatePicker
                mode="range"
                placeholder="Filter by date range..."
                value={{ from: startDate ? new Date(startDate) : undefined, to: endDate ? new Date(endDate) : undefined }}
                onChange={(val) => {
                  const range = val as { from?: Date; to?: Date };
                  setStartDate(range?.from ? format(range.from, 'yyyy-MM-dd') : '');
                  setEndDate(range?.to ? format(range.to, 'yyyy-MM-dd') : '');
                }}
              />
            </div>
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
        hasActiveFilters={hasActiveFilters}
        bulkActions={
          <div className="flex items-center gap-2">
            <Button variant="custom" size="none" onClick={() => {
              // To simplify, we get selected row IDs and fire the callback
              // But in this wrapper, we just delegate to the parent
              // (Our table will trigger this on selected order numbers)
            }}
              className="hidden" // we will wire this up visually in the table or delegate
            />
            <span className="text-xs font-semibold text-text-secondary mr-1">Bulk Edit:</span>
            <Button variant="custom" size="none" onClick={() => {
              // Handle advancing selected rows
            }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0E4B3E] bg-[#0E4B3E]/10 rounded-full hover:bg-[#0E4B3E]/20 transition-all cursor-pointer border border-[#0E4B3E]/15"
            >
              <CheckCircle size={13} />
              Advance Status
            </Button>
            <Button variant="custom" size="none" onClick={() => {
              // Handle cancelling selected rows
            }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-all cursor-pointer border border-red-200"
            >
              <Trash2 size={13} />
              Cancel Selected
            </Button>
          </div>
        }
      />
    </div>
  );
}
