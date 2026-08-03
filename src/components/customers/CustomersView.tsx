import React, { useState, useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';;
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { CustomerProfile } from '@/types/customer';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  History,
  MessageSquare,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { BaseCard } from '@/components/ui/BaseCard';

export function CustomersView() {
  const { addToast } = useUIStore();;
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);

  // Load customer directories (hook loads detailed selected profile if selectedCustId is provided!)
  const { customers, customer, isLoading, addNote, refetch } = useCustomers(selectedCustId || undefined);
  const { orders } = useOrders();

  // Search input filter state
  const [searchValue, setSearchValue] = useState('');

  // Table columns
  const columns = useMemo<ColumnDef<CustomerProfile>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Client Name',
        cell: ({ row }) => (
          <div className="flex flex-col select-none">
            <span className="font-poppins font-bold text-sm text-text-primary">{row.original.name}</span>
            {row.original.email && (
              <span className="text-xs font-medium text-text-secondary mt-0.5">{row.original.email}</span>
            )}
          </div>
        )
      },
      {
        accessorKey: 'phone',
        header: 'Contact Phone',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-text-primary">{row.original.phone}</span>
        )
      },
      {
        accessorKey: 'joinedDate',
        header: 'Member Since',
        cell: ({ row }) => {
          const d = new Date(row.original.joinedDate);
          return (
            <span className="text-xs text-text-secondary font-medium">
              {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          );
        }
      },
      {
        accessorKey: 'totalOrders',
        header: 'Total Orders',
        cell: ({ row }) => (
          <span className="text-xs font-bold text-accent-primary bg-accent-primary/5 border border-accent-primary/10 px-2.5 py-1 rounded-full select-none">
            {row.original.totalOrders} order{row.original.totalOrders === 1 ? '' : 's'}
          </span>
        )
      },
      {
        accessorKey: 'totalSpent',
        header: 'Lifetime Value (LTV)',
        cell: ({ row }) => (
          <span className="text-sm font-bold text-[#0E4B3E]">
            Rs. {row.original.totalSpent.toLocaleString()}
          </span>
        )
      },
      {
        accessorKey: 'avgOrderValue',
        header: 'AOV Ticket',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-text-secondary">
            Rs. {Math.round(row.original.avgOrderValue).toLocaleString()}
          </span>
        )
      }
    ],
    []
  );

  // Filter Pipeline
  const filteredCustomers = useMemo(() => {
    const safeCustomers = customers || [];
    return safeCustomers.filter((cust) => {
      const lower = searchValue.toLowerCase();
      return (
        cust.name.toLowerCase().includes(lower) ||
        cust.phone.includes(lower) ||
        (cust.email && cust.email.toLowerCase().includes(lower))
      );
    });
  }, [customers, searchValue]);

  // Notes Form State
  const [noteText, setNoteText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await addNote(noteText.trim(), 'Owner');
      addToast('Staff note added to customer profile.', 'success');
      setNoteText('');
    } catch (err) {
      addToast('Failed to save staff note', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  // Find other historical orders of this customer
  const customerOrders = useMemo(() => {
    if (!selectedCustId) return [];
    return orders.filter((o) => o.customer.id === selectedCustId);
  }, [orders, selectedCustId]);

  // --- DETAIL SUBVIEW ---
  if (selectedCustId && customer) {
    return (
      <div className="w-full flex flex-col animate-fade-in select-none pb-12">
        {/* Detail Nav header */}
        <div className="flex items-center gap-4 mb-8 border-b border-border-subtle/15 pb-6">
          <button
            onClick={() => setSelectedCustId(null)}
            className="w-10 h-10 rounded-full border border-border-subtle/40 hover:bg-[#FAFAFA] flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm active:scale-90"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-poppins font-bold text-xl sm:text-2xl lg:text-3xl text-text-primary tracking-tight leading-[1.2]">
              {customer.name}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-[1.5]">
              Registered Buyer since {new Date(customer.joinedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Master Detail Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">

          {/* Left Grid: Contact Coordinates & Historic Orders List */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5 lg:gap-6">

            {/* LTV & Metric Widgets Card Row */}
            <BaseCard noPadding className="shadow-sm">
              <div className="grid grid-cols-3 gap-4.5 p-5">
                <div className="text-center p-3 border-r border-border-subtle/10 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1 block">Lifetime Spend</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#0E4B3E]">Rs. {customer.totalSpent.toLocaleString()}</span>
                </div>
                <div className="text-center p-3 border-r border-border-subtle/10 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1 block">Total Orders</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#CA8A04]">{customer.totalOrders} sales</span>
                </div>
                <div className="text-center p-3 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1 block">AOV Ticket</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#2563EB]">Rs. {Math.round(customer.avgOrderValue).toLocaleString()}</span>
                </div>
              </div>
            </BaseCard>

            {/* Historical Checkout Logs */}
            <BaseCard
              title={
                <span className="flex items-center gap-2">
                  <History size={18} className="text-text-secondary" />
                  Historical Purchase Orders ({customerOrders.length})
                </span>
              }
              divider
              headerClassName="px-6 py-5 pb-4"
              contentClassName="px-6 pb-6 pt-4"
              noPadding
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle/15 pb-2 text-left text-xs text-text-secondary uppercase tracking-wider">
                      <th className="py-2.5 font-bold">Order #</th>
                      <th className="py-2.5 font-bold">Placed Date</th>
                      <th className="py-2.5 font-bold">Service Type</th>
                      <th className="py-2.5 font-bold">Checkout Total</th>
                      <th className="py-2.5 font-bold">Progress Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((o) => (
                      <tr key={o.orderNumber} className="border-b border-border-subtle/10 text-xs font-semibold text-text-primary py-3">
                        <td className="py-3 font-mono font-bold text-accent-primary uppercase tracking-wider">
                          {o.orderNumber.split('-').pop()}
                        </td>
                        <td className="py-3 text-text-secondary/85">
                          {new Date(o.placedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-text-secondary/75">{o.delivery.type}</td>
                        <td className="py-3 font-bold text-text-primary">Rs. {o.grandTotal.toLocaleString()}</td>
                        <td className="py-3 capitalize font-bold text-accent-primary">{o.status.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                    {customerOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-text-secondary/35 font-medium italic">
                          No recent transactions recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </BaseCard>

          </div>

          {/* Right Grid: Addresses & Private CRM Notes thread */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">

            {/* Contact Details Card */}
            <BaseCard
              title={
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-text-secondary" />
                  Contact Metadata
                </span>
              }
              divider
              headerClassName="px-5 py-4 pb-3"
              contentClassName="px-5 pb-5 pt-4"
              noPadding
            >
              <div className="flex flex-col gap-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-text-secondary font-bold uppercase block tracking-wider">Registered Name</span>
                  <span className="text-sm font-bold text-text-primary mt-0.5 block">{customer.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary font-bold uppercase block tracking-wider">Phone</span>
                  <a href={`tel:${customer.phone}`} className="text-accent-primary hover:underline mt-0.5 flex items-center gap-1.5 font-bold">
                    <Phone size={12} />
                    {customer.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary font-bold uppercase block tracking-wider">Email</span>
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="text-accent-primary hover:underline mt-0.5 flex items-center gap-1.5">
                      <Mail size={12} />
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-text-secondary/30 italic">Not provided</span>
                  )}
                </div>
              </div>
            </BaseCard>

            {/* Saved Delivery Addresses */}
            <BaseCard
              title={
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#2563EB]" />
                  Saved Delivery Dropoffs ({customer.addresses?.length || 0})
                </span>
              }
              divider
              headerClassName="px-5 py-4 pb-3"
              contentClassName="px-5 pb-5 pt-4"
              noPadding
            >
              <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-0.5 scrollbar-none">
                {customer.addresses?.map((addr) => (
                  <div key={addr.id} className="bg-slate-50 border border-border-subtle/15 rounded-xl p-3 select-none text-xs font-semibold text-text-primary flex items-start gap-2.5">
                    <MapPin size={13} className="text-[#2563EB] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary block">{addr.label}</span>
                      <span className="text-[11px] text-text-secondary font-medium leading-relaxed block mt-1">{addr.address}</span>
                    </div>
                  </div>
                ))}
                {(!customer.addresses || customer.addresses.length === 0) && (
                  <span className="block text-center text-xs text-text-secondary/40 py-4 italic font-medium">No saved addresses on profile.</span>
                )}
              </div>
            </BaseCard>

            {/* CRM Staff Log Notes */}
            <BaseCard
              title={
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-text-secondary" />
                  Staff Internal CRM Notes
                </span>
              }
              divider
              headerClassName="px-5 py-4 pb-3"
              contentClassName="px-5 pb-5 pt-4"
              noPadding
            >
              <form onSubmit={handlePostNote} className="mb-4">
                <div className="relative">
                  <textarea
                    required
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter warning/alert regarding client (e.g. 'requires change for Rs. 5000', 'polite buyer'...)"
                    rows={2}
                    className="w-full text-xs font-medium text-text-primary bg-[#FAFAFA] border border-border-subtle rounded-xl p-2.5 pr-10 focus:outline-none focus:border-accent-primary resize-none shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!noteText.trim() || isPosting}
                    className="absolute right-2.5 bottom-3 text-accent-primary hover:text-accent-dark disabled:text-text-secondary/25 cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>

              <div className="flex flex-col gap-3 max-h-52 overflow-y-auto scrollbar-none">
                {customer.notes?.map((note) => (
                  <div key={note.id} className="bg-slate-50 border border-border-subtle/15 rounded-xl p-3 text-xs select-none">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-text-primary">{note.author}</span>
                      <span className="text-[10px] text-text-secondary/40">
                        {new Date(note.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-text-secondary/85 leading-relaxed font-medium">{note.text}</p>
                  </div>
                ))}
                {(!customer.notes || customer.notes.length === 0) && (
                  <span className="block text-center text-xs text-text-secondary/40 py-4 italic font-medium">No previous logs for this client.</span>
                )}
              </div>
            </BaseCard>

          </div>

        </div>
      </div>
    );
  }

  // --- MAIN MASTER TABLE ---
  return (
    <div className="w-full flex flex-col animate-fade-in select-none">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary tracking-tight leading-[1.2]">
          Customer Management
        </h1>
        <p className="text-[15px] sm:text-base text-text-secondary mt-1 leading-[1.5]">
          Review buyer profiles, inspect total checkout summaries, write CRM logs, and examine saved addresses.
        </p>
      </div>

      {/* Toolbar Search bar */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search customers by name, phone or email..."
        hasActiveFilters={searchValue !== ''}
        onClearFilters={() => setSearchValue('')}
      />

      {/* TanStack DataTable wrapper */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        isLoading={isLoading}
        onRowClick={(row: any) => setSelectedCustId(row.id)}
        emptyMessage="No customer profiles match your search criteria."
        onClearFilters={() => setSearchValue('')}
        hasActiveFilters={searchValue !== ''}
      />
    </div>
  );
}
