import React, { forwardRef } from 'react';
import { Input, InputProps } from '../Input';
import { FormField, FormFieldProps } from './FormField';

export interface InputFieldProps extends InputProps, Omit<FormFieldProps, 'children'> {}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, required, hint, error, className, ...props }, ref) => {
    return (
      <FormField label={label} required={required} hint={hint} className={className}>
        <Input ref={ref} required={required} error={error} {...props} />
      </FormField>
    );
  }
);

InputField.displayName = 'InputField';
