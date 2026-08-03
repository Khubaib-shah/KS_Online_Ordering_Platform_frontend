import React from 'react';
import { cn } from '../../lib/cn';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex w-full h-11 rounded-xl border bg-white px-3 py-2 text-sm text-text-primary shadow-sm transition-all duration-200',
            'border-border-subtle focus-visible:outline-none focus-visible:border-accent-primary focus-visible:ring-1 focus-visible:ring-accent-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
            'placeholder:text-text-secondary/70',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary">
            {rightIcon}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-500 animate-fade-in">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
