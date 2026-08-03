import React, { useState } from 'react';
import { CreditCard, Save } from 'lucide-react';
import { RestaurantSettings, PaymentGateway } from '../../../types/settings';
import { IntegrationCard } from '../../integration/IntegrationCard';
import { Button } from '../../ui/Button';

interface IntegrationsTabProps {
  settings: RestaurantSettings;
  saveSettings: (settings: RestaurantSettings) => Promise<any>;
  refetch: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function IntegrationsTab({
  settings,
  saveSettings,
  refetch,
  addToast
}: IntegrationsTabProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [gateways, setGateways] = useState<PaymentGateway[]>(settings.paymentGateways || []);


  // Payment Gateways Controllers
  const toggleGatewayEnabled = (id: string) => {
    setGateways(gateways.map((g) => (g.id === id ? { ...g, isEnabled: !g.isEnabled } : g)));
  };

  const updateGatewayDetails = (id: string, field: 'accountTitle' | 'accountNumber', val: string) => {
    setGateways(
      gateways.map((g) => {
        if (g.id === id) {
          const det = g.details || {};
          return {
            ...g,
            details: { ...det, [field]: val }
          };
        }
        return g;
      })
    );
  };



  // Integrations Save (Gateways & Zones)
  const handleSaveIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const updatedSettings: RestaurantSettings = {
      ...settings,
      paymentGateways: gateways
    };

    try {
      await saveSettings(updatedSettings);
      addToast('Payment channels and delivery zones updated successfully!', 'success');
      refetch();
    } catch (err) {
      addToast('Failed to update integrations', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveIntegrations} className="flex flex-col gap-6.5 animate-fade-in text-left" id="form-integrations">
      <div className="border-b border-border-subtle/10 pb-3">
        <h3 className="font-sans font-extrabold text-base text-text-primary">
          Gateway Integrations & Logistics
        </h3>
        <p className="text-xs text-text-secondary">Configure online banking payment portals and delivery logistics sectors.</p>
      </div>

      {/* Sub-section 1: Payment Gateways */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-extrabold uppercase text-accent-primary border-b border-accent-primary/10 pb-1.5 flex items-center gap-1">
          <CreditCard size={13} />
          <span>1. Configured Payment Options</span>
        </h4>

        <div className="flex flex-col gap-3.5">
          {gateways.map((g) => (
            <IntegrationCard
              key={g.id}
              id={g.id}
              name={g.name}
              description={g.description}
              isEnabled={g.isEnabled}
              onToggle={() => toggleGatewayEnabled(g.id)}
              showDetails={g.id !== 'cod'}
              accountTitle={g.details?.accountTitle}
              accountNumber={g.details?.accountNumber}
              onAccountTitleChange={(val) => updateGatewayDetails(g.id, 'accountTitle', val)}
              onAccountNumberChange={(val) => updateGatewayDetails(g.id, 'accountNumber', val)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border-subtle/10 mt-2">
        <Button
          type="submit"
          variant="primary"
          loading={isSaving}
          icon={!isSaving && <Save size={13} />}
          className="rounded-full shadow-sm"
        >
          {isSaving ? 'Updating...' : 'Save Integrations'}
        </Button>
      </div>
    </form>
  );
}
