import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { cn } from '@/lib/cn';

export interface ModalHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export function ModalHeader({ title, subtitle, icon, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between border-b border-border-subtle p-2 sm:p-4 md:p-6 shrink-0 bg-white z-20", className)}>
      <div className="flex items-center gap-3 text-left">
        {icon && (
          <div className="w-10 h-10 bg-accent-tint-bg text-accent-primary rounded-xl flex items-center justify-center border border-accent-light/30 shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-poppins font-bold text-base md:text-lg text-text-primary leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] md:text-[11px] text-text-secondary font-normal mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        type="button"
        onClick={onClose}
        className="!w-8 !h-8 !p-0 rounded-full border border-border-subtle hover:border-slate-300 shrink-0"
      >
        <X size={15} />
      </Button>
    </div>
  );
}
