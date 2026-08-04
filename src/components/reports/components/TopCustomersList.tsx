import React from 'react';
import { Skeleton } from '../../ui/Skeleton';

interface TopCustomer {
  rank: number;
  id: string;
  name: string;
  orders: number;
  spent: number;
}

interface TopCustomersListProps {
  customers: TopCustomer[];
  isLoading?: boolean;
}

export function TopCustomersList({ customers, isLoading = false }: TopCustomersListProps) {
  return (
    <div className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6 lg:p-7 shadow-sm animate-fade-in flex flex-col h-full">
      <div className="mb-5 sm:mb-6 flex-shrink-0">
        <h3 className="text-lg font-bold text-text-primary tracking-tight">Top Customers</h3>
        <p className="text-sm text-text-secondary mt-1">Highest spending loyal customers</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Header */}
          <div className="grid grid-cols-[3rem_1fr_5rem_6rem] gap-4 mb-3 pb-3 border-b border-border-subtle text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            <div className="text-center">Rank</div>
            <div>Name</div>
            <div className="text-right">Orders</div>
            <div className="text-right">Spent</div>
          </div>

          {/* List */}
          <div className="space-y-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-[3rem_1fr_5rem_6rem] gap-4 py-3 items-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-10 ml-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))
            ) : customers.length === 0 ? (
              <div className="py-8 text-center text-text-secondary text-sm">
                No customer data found for this period.
              </div>
            ) : (
              customers.map((cust) => (
                <div 
                  key={cust.id} 
                  className="grid grid-cols-[3rem_1fr_5rem_6rem] gap-4 py-3 items-center hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors border-b border-border-subtle/40 last:border-0"
                >
                  {/* Rank */}
                  <div className="text-center font-bold text-sm text-text-secondary">
                    #{cust.rank}
                  </div>
                  
                  {/* Name */}
                  <div className="font-semibold text-sm text-text-primary truncate">
                    {cust.name}
                  </div>

                  {/* Orders */}
                  <div className="text-right text-sm font-medium text-text-secondary">
                    {cust.orders}
                  </div>

                  {/* Spent */}
                  <div className="text-right font-bold text-sm text-text-primary">
                    Rs. {cust.spent.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
