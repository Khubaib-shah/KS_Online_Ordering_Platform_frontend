import React from 'react';
import { RestaurantConfig } from '@/types/restaurant';
import { Input } from '@components/ui/Input';
import { Clock } from 'lucide-react';

interface RestaurantDeliveryStepProps {
  form: RestaurantConfig;
  errors: Record<string, string>;
  handleFieldChange: (path: string, value: any) => void;
  activeTab: string;
}

export const RestaurantDeliveryStep: React.FC<RestaurantDeliveryStepProps> = ({
  form,
  errors,
  handleFieldChange,
  activeTab
}) => {
  return (
    <section id="section-delivery" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'delivery' ? '' : 'hidden'}`}>
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="text-indigo-600" size={18} />
          <span>5. Delivery Logistics Settings</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">Configure average dispatch windows, fees, and minimum purchase volume thresholds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Estimated Delivery (Minutes)</label>
          <div className="relative">
            <Input
              type="number"
              min={1}
              required
              value={form.deliveryInfo.estimatedMinutes}
              onChange={(e) => handleFieldChange('deliveryInfo.estimatedMinutes', Number(e.target.value))}
            />
            <span className="absolute right-3.5 top-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">MINS</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Standard Delivery Fee</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">RS.</span>
            <Input
              type="number"
              min={0}
              required
              value={form.deliveryInfo.fee}
              onChange={(e) => handleFieldChange('deliveryInfo.fee', Number(e.target.value))}
              className={`w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors['deliveryInfo.fee'] ? 'border-rose-500' : 'border-slate-200'}`}
            />
          </div>
          {errors['deliveryInfo.fee'] && <p className="text-[10px] text-rose-500 font-bold">{errors['deliveryInfo.fee']}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Minimum Order Value</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">RS.</span>
            <Input
              type="number"
              min={0}
              required
              value={form.deliveryInfo.minOrder}
              onChange={(e) => handleFieldChange('deliveryInfo.minOrder', Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
