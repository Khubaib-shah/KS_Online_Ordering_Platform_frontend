import React, { forwardRef } from 'react';
import { cn } from '../../../lib/cn';

export interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  containerClassName?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, hint, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("text-left", containerClassName)}>
        <label className="flex items-start cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5 mr-3 shrink-0">
            <input
              type="checkbox"
              ref={ref}
              className={cn(
                "peer appearance-none w-4.5 h-4.5 border-2 border-slate-300 rounded-md checked:bg-accent-primary checked:border-accent-primary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2",
                className
              )}
              {...props}
            />
            <svg
              className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span className="text-[12px] font-bold text-text-primary uppercase tracking-wider block">{label}</span>
            {hint && <p className="text-[10px] text-text-secondary mt-1">{hint}</p>}
          </div>
        </label>
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';
