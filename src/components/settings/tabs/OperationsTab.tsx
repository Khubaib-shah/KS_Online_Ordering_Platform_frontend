import React, { useState, useEffect } from 'react';
import { Save, Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import { RestaurantSettings, OperatingHours, DeliveryZone } from '@/types/settings';
import { branchApi } from '@/lib/api/branch.api';
import { useBranchStore } from '@/store/branchStore';
import { Input } from '@/components/ui/Input';
import { InputField } from '@/components/ui/forms/InputField';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Combobox } from '@/components/ui/Combobox';
import { tenantsApi } from '@/lib/api/tenants.api';

interface OperationsTabProps {
  settings: RestaurantSettings;
  activeTenant: any;
  saveSettings: (settings: RestaurantSettings) => Promise<any>;
  refetch: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function OperationsTab({
  settings,
  activeTenant,
  saveSettings,
  refetch,
  addToast
}: OperationsTabProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [hours, setHours] = useState<OperatingHours[]>(settings.operatingHours || []);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryZone[]>(Array.isArray(settings.deliveryZones) ? settings.deliveryZones : []);
  const [globalAreas, setGlobalAreas] = useState<any[]>([]);
  const [currency] = useState(settings.currency || 'Rs.');

  useEffect(() => {
    const mainBranch = useBranchStore.getState().branches[0];
    if (mainBranch && activeTenant) {
      branchApi.getDeliveryZones(activeTenant.id, mainBranch.id).then(zones => {
        if (zones && zones.length > 0) {
          setDeliveryAreas(zones.map(z => {
            // Reconstruct the full string to match the Select option value
            const fullName = z.city && z.areaName && z.areaName !== z.city ? `${z.city} - ${z.areaName}` : z.areaName || '';

            // Map the integer back to the dropdown string
            let timeStr = "30 - 45 mins";
            if (z.estimatedMinutes === 50) timeStr = "35 - 50 mins";
            else if (z.estimatedMinutes === 60) timeStr = "45 - 60 mins";
            else if (z.estimatedMinutes === 90) timeStr = "60 - 90 mins";

            return {
              id: z.id,
              name: fullName,
              deliveryFee: Number(z.deliveryFee) || 0,
              estimatedTime: timeStr,
              isActive: z.isActive !== false
            };
          }));
        }
      }).catch(err => console.error("Failed to fetch delivery zones", err));
    }

    tenantsApi.getGlobalAreas().then(areas => {
      setGlobalAreas(areas || []);
    }).catch(err => console.error("Failed to fetch global areas", err));
  }, [activeTenant]);

  // Operating Hours Controllers
  const toggleDayActive = (day: string) => {
    setHours(hours.map((h) => (h.day === day ? { ...h, isClosed: !h.isClosed } : h)));
  };

  const updateDayTimes = (day: string, field: 'openTime' | 'closeTime', val: string) => {
    setHours(hours.map((h) => (h.day === day ? { ...h, [field]: val } : h)));
  };

  const addDeliveryArea = () => {
    const newArea: DeliveryZone = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      deliveryFee: 0,
      estimatedTime: '45 mins',
      isActive: true
    };
    setDeliveryAreas([...deliveryAreas, newArea]);
  };

  const removeDeliveryArea = (id: string) => {
    setDeliveryAreas(deliveryAreas.filter(a => a.id !== id));
  };

  const updateDeliveryArea = (id: string, field: keyof DeliveryZone, value: any) => {
    setDeliveryAreas(deliveryAreas.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // Operations Save
  const handleSaveOperations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const updatedSettings: RestaurantSettings = {
      ...settings,
      operatingHours: hours,
      deliveryZones: deliveryAreas
    };

    try {
      await saveSettings(updatedSettings);

      // Sync delivery zones to DB
      const mainBranch = useBranchStore.getState().branches[0];
      if (mainBranch && activeTenant) {
        try {
          const existingZones = await branchApi.getDeliveryZones(activeTenant.id, mainBranch.id);
          const existingIds = new Set(existingZones.map((z: any) => z.id));
          const currentIds = new Set(deliveryAreas.map(z => z.id));

          // Delete removed zones
          for (const ex of existingZones) {
            if (!currentIds.has(ex.id)) {
              await branchApi.deleteDeliveryZone(activeTenant.id, ex.id);
            }
          }

          // Create/Update zones
          for (const zone of deliveryAreas) {
            const nameParts = (zone.name || '').split(' - ');
            const extractedCity = nameParts.length > 0 ? nameParts[0] : 'Local';
            const extractedAreaName = nameParts.length > 1 ? nameParts.slice(1).join(' - ') : (zone.name || 'Unnamed Area');

            const payload = {
              areaName: extractedAreaName,
              city: extractedCity,
              deliveryFee: Number(zone.deliveryFee) || 0,
              estimatedMinutes: parseInt(String(zone.estimatedTime).replace(/\D/g, '')) || 45,
              isActive: zone.isActive !== false
            };

            if (existingIds.has(zone.id)) {
              await branchApi.updateDeliveryZone(activeTenant.id, zone.id, payload);
            } else {
              await branchApi.createDeliveryZone(activeTenant.id, mainBranch.id, payload);
            }
          }
        } catch (e) {
          console.error("Failed to sync delivery zones to DB", e);
        }
      }

      addToast('Operations settings synchronized!', 'success');
      refetch();
    } catch (err) {
      addToast('Failed to save operations settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveOperations} className="flex flex-col gap-6.5 animate-fade-in" id="form-operations">
      <div className="border-b border-border-subtle/10 pb-3 text-left">
        <h3 className="font-sans font-extrabold text-base text-text-primary">
          Operations & Logistics
        </h3>
        <p className="text-xs text-text-secondary">Manage your operating hours and delivery areas.</p>
      </div>

      {/* Sub-section 1: Operating Hours */}
      <div className="space-y-3.5 pt-4 text-left">
        <h4 className="text-[11px] font-extrabold uppercase text-accent-primary pb-1.5 flex items-center gap-1">
          <Clock size={13} />
          <span>1. Weekly Operational Schedule</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
          {hours.map((h) => (
            <div key={h.day} className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-border-subtle/15 rounded-xl text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!h.isClosed}
                  onChange={() => toggleDayActive(h.day)}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary cursor-pointer accent-accent-primary"
                />
                <span className="capitalize font-extrabold text-text-primary text-[11px]">{h.day.substring(0, 3)}</span>
              </label>

              {!h.isClosed ? (
                <div className="flex items-center gap-2.5">
                  <Input
                    type="text"
                    value={h.openTime}
                    onChange={(e) => updateDayTimes(h.day, 'openTime', e.target.value)}
                  />
                  <span className="text-[10px] text-text-secondary">to</span>
                  <Input
                    type="text"
                    value={h.closeTime}
                    onChange={(e) => updateDayTimes(h.day, 'closeTime', e.target.value)}
                  />
                </div>
              ) : (
                <span className="text-red-500 font-bold uppercase text-[9px] pr-4">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sub-section 2: Delivery Areas */}
      <div className="space-y-4 pt-5 border-t border-border-subtle/10 text-left">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-extrabold uppercase text-accent-primary flex items-center gap-1.5">
            <MapPin size={13} />
            <span>2. Delivery Areas</span>
          </h4>
          <Button
            type="button"
            variant="ghost"
            onClick={addDeliveryArea}
            icon={<Plus size={12} />}
            className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-2.5 py-1 rounded-md hover:bg-accent-primary/20 hover:text-accent-primary h-auto min-h-0"
          >
            Add Area
          </Button>
        </div>

        {deliveryAreas.length === 0 ? (
          <p className="text-[11px] text-text-secondary text-center py-4 bg-slate-50 rounded-xl border border-dashed border-border-subtle/50">
            No delivery areas configured. Customers might not be able to checkout with delivery.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {deliveryAreas.map((area) => (
              <div key={area.id} className="flex flex-col gap-2 p-3 bg-white border border-border-subtle/30 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Combobox
                      value={area.name}
                      onChange={(val) => updateDeliveryArea(area.id, 'name', val)}
                      options={globalAreas.map((ga: any) => {
                        const areaValue = `${ga.city} - ${ga.region} - ${ga.name}`;
                        return {
                          value: areaValue,
                          label: `${ga.city}, ${ga.region}, ${ga.name}`,
                          disabled: deliveryAreas.some((a) => a.name === areaValue && a.id !== area.id)
                        };
                      })}
                      placeholder="Select Area..."
                      searchPlaceholder="Search areas..."
                      className="font-bold"
                    />
                  </div>
                  <Button variant="custom" size="none" type="button"
                    onClick={() => removeDeliveryArea(area.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all ml-2"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <InputField
                      label={`Fee (${currency})`}
                      type="number"
                      value={area.deliveryFee}
                      onChange={(e) => updateDeliveryArea(area.id, 'deliveryFee', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex-1">
                    <InputField
                      label="Est. Time"
                      type="text"
                      value={area.estimatedTime}
                      onChange={(e) => updateDeliveryArea(area.id, 'estimatedTime', e.target.value)}
                      placeholder="e.g. 45 mins"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border-subtle/10 mt-2">
        <Button
          type="submit"
          loading={isSaving}
          icon={<Save size={13} />}
          size="sm"
          className="rounded-full px-5 h-10 text-xs font-bold"
        >
          {isSaving ? 'Saving...' : 'Save operations'}
        </Button>
      </div>
    </form>
  );
}
