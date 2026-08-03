import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof motion.button> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'none';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  id?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, iconRight, disabled, children, id, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        id={id}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'inline-flex items-center justify-center font-inter font-semibold rounded-button transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',

          variant === 'primary' &&
          'bg-accent-primary text-white hover:bg-accent-dark shadow-button',

          variant === 'secondary' &&
          'bg-white border-2 border-text-primary text-text-primary hover:bg-surface-hover',

          variant === 'ghost' &&
          'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary',


          variant === 'outline' &&
          'bg-transparent border-2 border-border-subtle text-text-primary hover:bg-slate-50',

          variant === 'destructive' &&
          'bg-rose-500 text-white hover:bg-rose-600 shadow-button',

          size === 'sm' && 'h-10 md:h-9 px-3.5 md:px-4 text-[13px] gap-1.5',
          size === 'md' && 'h-12 md:h-11 px-5 md:px-6 text-[15px] gap-2',
          size === 'lg' && 'h-[52px] md:h-12 px-7 md:px-8 text-base gap-2.5',
          size === 'none' && '',

          (disabled || loading) && 'opacity-50 cursor-not-allowed hover:transform-none',

          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {!loading && icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
        {children}
        {!loading && iconRight && <span className="shrink-0 flex items-center justify-center">{iconRight}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
