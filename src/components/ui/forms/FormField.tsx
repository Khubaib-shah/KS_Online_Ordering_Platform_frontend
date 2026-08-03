import React from 'react';
import { cn } from '../../../lib/cn';

export interface FormFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 text-left w-full", className)}>
      {label && (
        <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {hint && (
        <p className="text-[10px] text-text-secondary/80 mt-1">{hint}</p>
      )}
    </div>
  );
}
