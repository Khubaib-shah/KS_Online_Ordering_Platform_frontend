import React, { forwardRef } from 'react';
import { cn } from '../../../lib/cn';

export interface SwitchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  containerClassName?: string;
}

export const SwitchField = forwardRef<HTMLInputElement, SwitchFieldProps>(
  ({ label, hint, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("flex items-center justify-between", containerClassName)}>
        <div className="text-left pr-4">
          <span className="text-xs font-medium text-text-primary block">{label}</span>
          {hint && <span className="text-[10px] text-text-secondary font-normal block mt-0.5">{hint}</span>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          <div className={cn(
            "w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary",
            className
          )}></div>
        </label>
      </div>
    );
  }
);

SwitchField.displayName = 'SwitchField';
