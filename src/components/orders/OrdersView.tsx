import { useState, useEffect } from 'react'; import { Button } from '@/components/ui/Button';

import { Order } from '@/types/order';
import { useOrders } from '@/hooks/useOrders';
import { useUIStore } from '@/store/uiStore';
import { menuApi } from '@/lib/api/menu.api';
import { PLATFORM_PREFIX } from '@/lib/constants';
import { getTenantKey } from '@/lib/security';
import { Kanban, ListFilter, Printer } from 'lucide-react';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { OrderDetailView } from '@/components/orders/OrderDetailView';
import { PrintQueueList } from '@/components/receipt/PrintQueueList';

export function OrdersView() {
  const { addToast } = useUIStore();;
  const { orders, isLoading, updateStatus, cancel, refetch } = useOrders();

  // Local state for toggling layouts
  const [activeTab, setActiveTab] = useState<'list' | 'kanban' | 'print_queue'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Live order simulation engine
  useEffect(() => {
    const pakNames = [
      'Faizan Rasheed',
      'Maria Khattak',
      'Danish Qureshi',
      'Sanaullah Khan',
      'Ayesha Siddiqui',
      'Zainab Naqvi',
      'Bilal Farooq',
      'Khurram Shehzad'
    ];
    const pakPhones = [
      '0300-1293812',
      '0321-4829311',
      '0333-7281932',
      '0312-3920192',
      '0345-8910291',
      '0301-4729102'
    ];
    const karachiAreas = [
      'Clifton Block 4',
      'DHA Phase 6',
      'PECHS Block 2',
      'Gulshan-e-Iqbal Block 13D',
      'Bahadurabad Street 5'
    ];
    const streets = [
      'House 42-A, Lane 3',
      'Flat 102, Indolj Heights',
      'Plot 92-C, Commercial Area',
      'House 12, Main Jinnah Rd'
    ];

    const interval = setInterval(async () => {
      // 10% chance to trigger a live incoming order every 20 seconds (avg ~3-4 mins, or we speed it up slightly for preview/demo to 25% chance for quicker testing!)
      if (Math.random() > 0.45) {

        const itemsToUse = await menuApi.getMenuItems();
        if (!itemsToUse || itemsToUse.length === 0) return;

        // Create random order items
        const numItems = Math.floor(Math.random() * 2) + 1; // 1-2 items
        const itemsList: Order['items'] = [];
        let subtotal = 0;

        for (let i = 0; i < numItems; i++) {
          const randomItem = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];
          const qty = Math.floor(Math.random() * 2) + 1; // 1-2
          const total = (randomItem.discountPrice || randomItem.basePrice || 0) * qty;
          subtotal += total;

          itemsList.push({
            id: `item-${Date.now()}-${i}`,
            name: randomItem.name,
            qty,
            unitPrice: randomItem.discountPrice || randomItem.basePrice || 0,
            total,
            selectedVariants: []
          });
        }

        const tax = Math.round(subtotal * 0.13);
        const deliveryFee = Math.random() > 0.3 ? 150 : 0;
        const grandTotal = subtotal + tax + deliveryFee;

        const customerName = pakNames[Math.floor(Math.random() * pakNames.length)];
        const customerPhone = pakPhones[Math.floor(Math.random() * pakPhones.length)];
        const orderArea = karachiAreas[Math.floor(Math.random() * karachiAreas.length)];
        const orderStreet = streets[Math.floor(Math.random() * streets.length)];

        const newSimulatedOrder: Order = {
          orderNumber: `GHL-${Date.now().toString().slice(-6)}-NEW`,
          placedAt: new Date().toISOString(),
          customer: {
            id: `cust-${Date.now()}`,
            name: customerName,
            phone: customerPhone,
            email: `${customerName.toLowerCase().replace(/\s/g, '')}@gmail.com`
          },
          items: itemsList,
          subtotal,
          tax,
          deliveryFee,
          discount: 0,
          grandTotal,
          paymentMethod: Math.random() > 0.5 ? 'CASH' : 'ONLINE',
          paymentStatus: 'UNPAID',
          status: 'PENDING',
          delivery: {
            type: 'DELIVERY',
            area: orderArea,
            address: `${orderStreet}, ${orderArea}, Karachi`
          },
          timeline: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
              note: 'Order placed via online web portal.'
            }
          ],
          notes: []
        };

        // Write directly to localStorage to keep page states in sync!
        const key = getTenantKey(`${PLATFORM_PREFIX}_orders`);
        const existingData = localStorage.getItem(key);
        const ordersArray = existingData ? JSON.parse(existingData) : [];
        ordersArray.unshift(newSimulatedOrder);
        localStorage.setItem(key, JSON.stringify(ordersArray));

        // Display beautiful live notification
        addToast(`New live order from ${customerName} (Rs. ${grandTotal.toLocaleString()})`, 'info');

        // Trigger a quiet refetch
        refetch();
      }
    }, 28000); // Poll simulator every 28 seconds

    return () => clearInterval(interval);
  }, [addToast, refetch]);

  const handleRowClick = (order: Order) => {
    if (order.id) {
      setSelectedOrderId(order.id);
    }
  };

  // If viewing detailed view of a single order
  if (selectedOrderId) {
    return (
      <OrderDetailView
        orderId={selectedOrderId}
        onBack={() => {
          setSelectedOrderId(null);
          refetch(); // Refresh list values
        }}
      />
    );
  }

  return (
    <div className="w-full flex flex-col h-full select-none animate-fade-in">

      {/* Top Banner & Mode Segment Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary tracking-tight leading-[1.2]">
            Orders Hub
          </h1>
          <p className="text-[15px] sm:text-base text-text-secondary mt-1 leading-[1.5]">
            Process, inspect, print receipts, and manage all incoming Indolj deliveries.
          </p>
        </div>

        {/* Segment Pill View Toggles */}
        <div className="flex items-center gap-1 bg-[#F5F5F5] border border-border-subtle/35 p-1 rounded-full self-start sm:self-auto shadow-inner select-none">
          {[
            { id: 'list', icon: ListFilter, title: 'Orders Table', label: 'Orders Table', short: 'Table' },
            { id: 'kanban', icon: Kanban, title: 'Live Kitchen Board', label: 'Live Kitchen Board', short: 'Board' },
            { id: 'print_queue', icon: Printer, title: 'Cloud Print Spool Queue', label: 'Print Spooler', short: 'Print' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="custom"
              size="none"
              onClick={() => setActiveTab(tab.id as any)}
              title={tab.title}
              className={`
                flex items-center gap-1.5 px-2.5 sm:px-4.5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-white text-accent-dark shadow-sm'
                  : 'text-text-secondary hover:text-accent-primary'
                }
              `}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="inline sm:hidden">{tab.short}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Render selected subview */}
      {activeTab === 'list' ? (
        <OrdersTable
          orders={orders}
          isLoading={isLoading}
          onStatusChange={updateStatus}
          onRowClick={handleRowClick}
          onBulkAdvance={async (numbers) => {
            // Bulk status trigger
            for (const num of numbers) {
              await updateStatus(num, 'DELIVERED');
            }
            refetch();
            addToast(`Selected orders advanced to Delivered!`, 'success');
          }}
          onBulkCancel={async (numbers) => {
            for (const num of numbers) {
              await cancel(num, 'Bulk cancellation by manager');
            }
            refetch();
            addToast(`Selected orders cancelled.`, 'success');
          }}
        />
      ) : activeTab === 'kanban' ? (
        <KanbanBoard
          orders={orders}
          onStatusChange={updateStatus}
          onBack={() => setActiveTab('list')}
        />
      ) : (
        <PrintQueueList />
      )}
    </div>
  );
}
