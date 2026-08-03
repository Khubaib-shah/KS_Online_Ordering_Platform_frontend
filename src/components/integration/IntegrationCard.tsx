import React from 'react';
import { cn } from '@/lib/cn';
import { SwitchField } from '@/components/ui/forms/SwitchField';
import { InputField } from '@/components/ui/forms/InputField';

export interface IntegrationCardProps {
  key?: React.Key;
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  showDetails?: boolean;
  accountTitle?: string;
  accountNumber?: string;
  onAccountTitleChange?: (val: string) => void;
  onAccountNumberChange?: (val: string) => void;
  className?: string;
}

export function IntegrationCard({
  name,
  description,
  isEnabled,
  onToggle,
  showDetails,
  accountTitle,
  accountNumber,
  onAccountTitleChange,
  onAccountNumberChange,
  className
}: IntegrationCardProps) {
  return (
    <div className={cn("bg-slate-50 border border-border-subtle/15 rounded-2xl p-4 flex flex-col gap-3", className)}>
      <SwitchField
        label={<span className="text-[13px] font-extrabold text-slate-900">{name}</span>}
        hint={description}
        checked={isEnabled}
        onChange={onToggle}
      />

      {showDetails && isEnabled && (
        <div className="grid grid-cols-2 gap-4 border-t border-border-subtle/10 pt-3 text-xs font-semibold">
          <InputField
            label="Account Title Name"
            required
            value={accountTitle || ''}
            onChange={(e) => onAccountTitleChange?.(e.target.value)}
            placeholder="Account Holder"
          />
          <InputField
            label="Account / Phone Number"
            required
            value={accountNumber || ''}
            onChange={(e) => onAccountNumberChange?.(e.target.value)}
            placeholder="0300-XXXXXXX"
          />
        </div>
      )}
    </div>
  );
}
