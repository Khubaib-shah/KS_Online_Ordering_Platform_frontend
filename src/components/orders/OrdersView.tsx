import { useState } from 'react';
import { Kanban, ListFilter, Printer } from 'lucide-react';

import { Order } from '@/types/order';
import { Button } from '@/components/ui/Button';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { OrderDetailView } from '@/components/orders/OrderDetailView';
import { PrintQueueList } from '@/components/receipt/PrintQueueList';

export function OrdersView() {
  const [activeTab, setActiveTab] = useState<'list' | 'kanban' | 'print_queue'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);


  const handleRowClick = (order: Order) => {
    if (order.id) {
      setSelectedOrderId(order.id);
    }
  };

  if (selectedOrderId) {
    return (
      <OrderDetailView
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
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
        <OrdersTable onRowClick={handleRowClick} />
      ) : activeTab === 'kanban' ? (
        <KanbanBoard
          onBack={() => setActiveTab('list')}
        />
      ) : (
        <PrintQueueList />
      )}
    </div>
  );
}
