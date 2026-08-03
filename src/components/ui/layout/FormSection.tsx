import React from 'react';
import { cn } from '../../../lib/cn';

export interface FormSectionProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, className, children }: FormSectionProps) {
  return (
    <div className={cn("bg-white border border-border-subtle rounded-2xl p-5 space-y-4 shadow-xs", className)}>
      {(title || description) && (
        <div className="border-b border-border-subtle pb-2 text-left">
          {title && (
            <span className="text-[11px] font-bold uppercase text-text-primary tracking-wider block">
              {title}
            </span>
          )}
          {description && (
            <p className="text-xs text-text-secondary mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
