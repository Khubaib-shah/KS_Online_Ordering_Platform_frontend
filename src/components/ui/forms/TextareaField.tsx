import React, { forwardRef } from 'react';
import { FormField, FormFieldProps } from './FormField';
import { cn } from '../../../lib/cn';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, Omit<FormFieldProps, 'children'> {}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, required, hint, error, className, ...props }, ref) => {
    return (
      <FormField label={label} required={required} hint={hint} error={error} className={className}>
        <textarea
          ref={ref}
          required={required}
          className={cn(
            "w-full text-xs font-normal text-text-primary placeholder:text-text-secondary/60 bg-white border border-border-subtle rounded-xl p-3 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all resize-none shadow-xs text-left",
            error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
            props.disabled && "cursor-not-allowed opacity-50 bg-surface-muted"
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-red-500 mt-1.5">{error}</p>
        )}
      </FormField>
    );
  }
);

TextareaField.displayName = 'TextareaField';
