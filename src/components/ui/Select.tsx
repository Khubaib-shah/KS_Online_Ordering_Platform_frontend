import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import { ChevronDown, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Popover, PopoverTrigger, PopoverContent } from '@components/ui/Popover';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, leftIcon, children, value, defaultValue, onChange, disabled, ...props }, ref) => {
    const [open, setOpen] = useState(false);

    // Manage internal state for uncontrolled usage
    const [internalValue, setInternalValue] = useState<string | number | readonly string[] | undefined>(
      value !== undefined ? value : defaultValue
    );

    // Sync if value prop changes (controlled)
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const hiddenSelectRef = useRef<HTMLSelectElement>(null);

    // Forward the ref to the hidden select
    useImperativeHandle(ref, () => hiddenSelectRef.current as HTMLSelectElement);

    // Parse children to extract options
    const options: { value: string; label: string; disabled?: boolean }[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const childElement = child as React.ReactElement<any>;
        options.push({
          value: String(childElement.props.value ?? childElement.props.children ?? ''),
          label: String(childElement.props.children ?? childElement.props.value ?? ''),
          disabled: childElement.props.disabled,
        });
      }
    });

    // Handle React Fragments or mapped arrays gracefully
    const flattenChildren = (children: React.ReactNode): React.ReactNode[] => {
      return React.Children.toArray(children).flatMap(child => {
        if (React.isValidElement(child) && child.type === React.Fragment) {
          const fragChild = child as React.ReactElement<any>;
          return flattenChildren(fragChild.props.children);
        }
        return child;
      });
    };

    const flatChildren = flattenChildren(children);
    const parsedOptions = flatChildren.map((child: any) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const childElement = child as React.ReactElement<any>;
        return {
          value: String(childElement.props.value ?? childElement.props.children ?? ''),
          label: String(childElement.props.children ?? childElement.props.value ?? ''),
          disabled: childElement.props.disabled,
        };
      }
      return null;
    }).filter(Boolean) as { value: string; label: string; disabled?: boolean }[];

    const selectedOption = parsedOptions.find((opt) => opt.value === String(internalValue));

    const handleSelect = (newValue: string) => {
      setOpen(false);

      if (value === undefined) {
        setInternalValue(newValue);
      }

      const selectEl = hiddenSelectRef.current;
      if (selectEl) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(selectEl, newValue);
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (onChange) {
        const e = {
          target: { value: newValue },
          currentTarget: { value: newValue },
          preventDefault: () => { },
          stopPropagation: () => { },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(e);
      }
    };

    return (
      <div className="relative w-full">
        {/* Hidden native select for form serialization and refs */}
        <select
          ref={hiddenSelectRef}
          className="hidden"
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'flex w-full items-center justify-between h-11 rounded-xl border bg-white px-3 py-2 text-sm text-text-primary shadow-sm transition-all duration-200 outline-none text-left',
                'border-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:border-accent-primary',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
                leftIcon && 'pl-10',
                error && 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
                className
              )}
            >
              {leftIcon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  {leftIcon}
                </div>
              )}
              <span className="truncate flex-1">
                {selectedOption ? selectedOption.label : 'Select an option...'}
              </span>
              <ChevronDown size={16} className="text-text-secondary ml-2 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 shadow-xl border-border-subtle rounded-xl max-h-64 overflow-y-auto" align="start">
            <div className="flex flex-col gap-0.5">
              {parsedOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors outline-none text-left",
                    opt.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 focus:bg-slate-100",
                    String(internalValue) === opt.value ? "bg-accent-tint-bg text-accent-primary font-medium" : "text-text-primary"
                  )}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {String(internalValue) === opt.value && (
                    <Check size={16} className="text-accent-primary ml-2 shrink-0" />
                  )}
                </button>
              ))}
              {parsedOptions.length === 0 && (
                <div className="px-3 py-4 text-sm text-text-secondary text-center">
                  No options
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

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

Select.displayName = 'Select';
