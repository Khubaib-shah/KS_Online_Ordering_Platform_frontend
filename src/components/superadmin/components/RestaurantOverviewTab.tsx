import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Star,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { ReusableAreaChart } from '@/components/ui/charts';
import { formatCompactNumber } from '@/lib/formatters';

interface RestaurantOverviewTabProps {
  monthlyRevenue: number;
  currency: string;
  brandColor: string;
  tintBg: string;
  activeOrdersCount: number;
  currentRating: number;
  chartData: any[];
  activeOrders: any[];
  starPct5: number;
  starPct4: number;
  starPct3: number;
  starPct2: number;
  tagline: string;
  address: string;
  phone: string;
  cuisine: string;
  minOrderValue: number;
  deliveryFee: number;
  taxRate: number;
  serviceCharge: number;
}

export const RestaurantOverviewTab: React.FC<RestaurantOverviewTabProps> = ({
  monthlyRevenue,
  currency,
  brandColor,
  tintBg,
  activeOrdersCount,
  currentRating,
  chartData,
  activeOrders,
  starPct5,
  starPct4,
  starPct3,
  starPct2,
  tagline,
  address,
  phone,
  cuisine,
  minOrderValue,
  deliveryFee,
  taxRate,
  serviceCharge
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* COLUMN 1: ANALYTICS & ACTIVE ORDERS (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Detailed Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Metric 1 */}
          <div className="bg-white border border-border-subtle p-6 rounded-card shadow-card text-left relative overflow-hidden group hover:bg-surface-hover transition-all duration-300">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1 font-inter">Monthly Revenue</span>
            <h4 className="text-3xl font-bold font-poppins text-text-primary tracking-tight">
              {currency} {formatCompactNumber(monthlyRevenue)}
            </h4>
            <div className="text-[10px] font-medium text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp size={11} className="shrink-0" />
              <span>30-Day aggregate store footprint</span>
            </div>
            <div
              className="absolute right-0 bottom-0 w-24 h-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-300 pointer-events-none"
              style={{ color: brandColor }}
            >
              <DollarSign className="w-full h-full" />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white border border-border-subtle p-6 rounded-card shadow-card text-left relative overflow-hidden group hover:bg-surface-hover transition-all duration-300">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1 font-inter">Active Orders</span>
            <h4 className="text-3xl font-bold font-poppins text-text-primary tracking-tight flex items-baseline gap-1.5">
              {activeOrdersCount}
              <span className="text-xs text-text-secondary font-normal font-inter">in kitchen pipeline</span>
            </h4>
            <div
              className="text-[10px] font-medium mt-2"
              style={{ color: brandColor }}
            >
              Requires instant fulfillment
            </div>
            <div
              className="absolute right-0 bottom-0 w-24 h-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-300 pointer-events-none"
              style={{ color: brandColor }}
            >
              <ShoppingBag className="w-full h-full" />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white border border-border-subtle p-6 rounded-card shadow-card text-left relative overflow-hidden group hover:bg-surface-hover transition-all duration-300">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1 font-inter">Guest Rating</span>
            <h4 className="text-3xl font-bold font-poppins text-text-primary tracking-tight flex items-center gap-2">
              {currentRating}
              <span className="flex text-amber-500 shrink-0"><Star size={18} className="fill-current" /></span>
            </h4>
            <div className="text-[10px] font-medium text-text-secondary mt-2">
              Based on guest checkout reviews
            </div>
            <div
              className="absolute right-0 bottom-0 w-24 h-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-300 pointer-events-none"
              style={{ color: brandColor }}
            >
              <Star className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Revenue Trend Visual chart */}
        <div className="bg-white border border-border-subtle rounded-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary font-poppins">6-Day Store Revenue Velocity</h3>
              <p className="text-xs text-text-secondary font-inter">Visual tracking of daily transaction volume and order counts.</p>
            </div>
            <span
              className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-opacity-20"
              style={{
                color: brandColor,
                backgroundColor: tintBg,
                borderColor: brandColor
              }}
            >
              Live Operations telemetry
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ReusableAreaChart
              data={chartData}
              xKey="name"
              yKey="Revenue"
              strokeColor={brandColor}
              gradientId="colorRevenue"
              height={224}
            />
          </div>
        </div>

        {/* Active Orders List */}
        <div className="bg-white border border-border-subtle rounded-card p-6 shadow-card space-y-4">
          <h3 className="text-base font-semibold text-text-primary font-poppins">
            Active Store Operational Orders ({activeOrdersCount})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] font-semibold uppercase tracking-wider text-text-secondary pb-3">
                  <th className="pb-3 pl-2">Order No</th>
                  <th className="pb-3">Placed At</th>
                  <th className="pb-3">Customer Details</th>
                  <th className="pb-3">Fulfillment</th>
                  <th className="pb-3 text-right">Grand Total</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40 text-xs font-medium text-text-primary font-inter">
                {activeOrdersCount === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-secondary">
                      <CheckCircle size={32} className="mx-auto text-emerald-500 mb-3" />
                      <p className="text-sm font-semibold text-text-primary">All orders fully fulfilled!</p>
                      <p className="text-xs text-text-secondary mt-1">No active kitchen orders in the queue.</p>
                    </td>
                  </tr>
                ) : (
                  activeOrders.slice().reverse().map((order: any) => (
                    <tr key={order.orderNumber} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-4 pl-2 font-mono font-semibold" style={{ color: brandColor }}>
                        {order.orderNumber}
                      </td>
                      <td className="py-4 text-xs text-text-secondary font-mono">
                        {new Date(order.placedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4">
                        <div className="font-semibold text-text-primary">{order.customer.name}</div>
                        <div className="text-[10px] text-text-secondary font-mono leading-none mt-0.5">{order.customer.phone}</div>
                      </td>
                      <td className="py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-hover text-text-primary border border-border-subtle px-2 py-0.5 rounded-md font-mono">
                          {order.delivery?.type || 'dine-in'}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono font-semibold">
                        {currency} {(order.grandTotal || 0).toLocaleString()}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${order.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          order.status === 'preparing' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                            order.status === 'ready' ? 'bg-teal-50 text-teal-600 border border-teal-200' :
                              order.status === 'dispatched' ? 'bg-sky-50 text-sky-600 border border-sky-200' :
                                'bg-slate-50 text-slate-600'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* COLUMN 2: CUSTOMER RATING DETAILS & PREVIEW OVERVIEW (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Star Rating Breakdown card */}
        <div className="bg-white border border-border-subtle rounded-card p-6 shadow-card space-y-4">
          <h3 className="text-base font-semibold text-text-primary font-poppins flex items-center gap-1.5">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span>Customer Satisfaction Score</span>
          </h3>

          <div className="text-center py-4 space-y-1 bg-surface-muted/50 rounded-2xl border border-border-subtle/60">
            <p className="text-4xl font-bold font-poppins text-text-primary leading-none">{currentRating}</p>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider font-inter">out of 5.0 rating index</p>
            <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-1">
              <Star size={18} className="fill-current" />
              <Star size={18} className="fill-current" />
              <Star size={18} className="fill-current" />
              <Star size={18} className="fill-current" />
              <Star size={18} className="fill-current" style={{ opacity: currentRating >= 4.7 ? 1 : 0.4 }} />
            </div>
          </div>

          <div className="space-y-3 font-inter">
            {/* 5 star */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                <span>5 Stars Excellent</span>
                <span className="font-mono text-text-primary">{starPct5}%</span>
              </div>
              <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${starPct5}%`, backgroundColor: brandColor }} />
              </div>
            </div>

            {/* 4 star */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                <span>4 Stars Very Good</span>
                <span className="font-mono text-text-primary">{starPct4}%</span>
              </div>
              <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full rounded-full opacity-80" style={{ width: `${starPct4}%`, backgroundColor: brandColor }} />
              </div>
            </div>

            {/* 3 star */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                <span>3 Stars Average</span>
                <span className="font-mono text-text-primary">{starPct3}%</span>
              </div>
              <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full rounded-full opacity-50" style={{ width: `${starPct3}%`, backgroundColor: brandColor }} />
              </div>
            </div>

            {/* 2 & 1 star */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                <span>2 or 1 Stars Needs Work</span>
                <span className="font-mono text-text-primary">{starPct2}%</span>
              </div>
              <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full rounded-full opacity-20" style={{ width: `${starPct2}%`, backgroundColor: brandColor }} />
              </div>
            </div>
          </div>
        </div>

        {/* Physical Parameters Summary */}
        <div className="bg-white border border-border-subtle rounded-card p-6 shadow-card space-y-4 text-left">
          <h3 className="text-base font-semibold text-text-primary font-poppins flex items-center gap-1.5">
            <MapPin size={16} className="text-text-secondary" style={{ color: brandColor }} />
            <span>Operations Parameters</span>
          </h3>

          <div className="space-y-3.5 text-xs font-medium text-text-primary font-inter">
            <div className="pb-3 border-b border-border-subtle/50">
              <span className="text-[10px] font-bold uppercase text-text-secondary block mb-1">Brand Tagline / Slogan</span>
              <span className="text-text-primary font-semibold">{tagline || 'No tagline configured'}</span>
            </div>
            <div className="pb-3 border-b border-border-subtle/50">
              <span className="text-[10px] font-bold uppercase text-text-secondary block mb-1">Physical Store Address</span>
              <span className="text-text-primary font-semibold">{address || 'No address logged'}</span>
            </div>
            <div className="pb-3 border-b border-border-subtle/50">
              <span className="text-[10px] font-bold uppercase text-text-secondary block mb-1">Phone Contact</span>
              <span className="text-text-primary font-semibold font-mono">{phone || 'No phone number'}</span>
            </div>
            <div className="pb-1">
              <span className="text-[10px] font-bold uppercase text-text-secondary block mb-1">Cuisine Specialties</span>
              <span className="text-text-primary font-semibold">{cuisine || 'Multi-Cuisine focus'}</span>
            </div>
          </div>
        </div>

        {/* Quick Config details */}
        <div className="bg-white border border-border-subtle rounded-card p-6 shadow-card space-y-4 text-left">
          <h3 className="text-xs font-bold uppercase text-text-secondary font-poppins tracking-wider">Fee schedules</h3>
          <div className="grid grid-cols-2 gap-3.5 text-xs font-inter">
            <div className="bg-surface-muted p-3.5 rounded-xl border border-border-subtle/70">
              <span className="text-[9px] font-bold text-text-secondary block uppercase">Min. Order</span>
              <p className="font-bold text-text-primary font-mono text-sm mt-0.5">{currency} {minOrderValue}</p>
            </div>
            <div className="bg-surface-muted p-3.5 rounded-xl border border-border-subtle/70">
              <span className="text-[9px] font-bold text-text-secondary block uppercase">Delivery Fee</span>
              <p className="font-bold text-text-primary font-mono text-sm mt-0.5">{currency} {deliveryFee}</p>
            </div>
            <div className="bg-surface-muted p-3.5 rounded-xl border border-border-subtle/70">
              <span className="text-[9px] font-bold text-text-secondary block uppercase">Tax Surcharge</span>
              <p className="font-bold text-text-primary font-mono text-sm mt-0.5">{taxRate}%</p>
            </div>
            <div className="bg-surface-muted p-3.5 rounded-xl border border-border-subtle/70">
              <span className="text-[9px] font-bold text-text-secondary block uppercase">Service Surcharge</span>
              <p className="font-bold text-text-primary font-mono text-sm mt-0.5">{serviceCharge}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
