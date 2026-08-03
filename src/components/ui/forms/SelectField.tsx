import React, { forwardRef } from 'react';
import { FormField, FormFieldProps } from './FormField';
import { Select, SelectProps } from '../Select';

export interface SelectFieldProps extends SelectProps, Omit<FormFieldProps, 'children'> {
    options?: { label: string; value: string | number }[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, required, hint, error, className, options, children, ...props }, ref) => {
    return (
      <FormField label={label} required={required} hint={hint} className={className}>
        <Select ref={ref} required={required} error={error} {...props}>
          {options ? options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
          )) : children}
        </Select>
      </FormField>
    );
  }
);

SelectField.displayName = 'SelectField';
