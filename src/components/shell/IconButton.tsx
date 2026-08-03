import { Select } from '../ui/Select';
import React from 'react';
import { Input } from '../ui/Input';
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';

interface IconButtonProps extends React.ComponentPropsWithoutRef<typeof motion.button> {
  children: React.ReactNode;
  badge?: boolean;
  badgeCount?: number;
  id?: string;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, badge, badgeCount, className, id, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        id={id}
        whileTap={{ scale: 0.95 }}
        aria-label={ariaLabel}
        className={cn(
          'relative w-10.5 h-10.5 rounded-full bg-white border border-border-subtle shadow-button hover:bg-surface-hover hover:border-text-secondary/20 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 shrink-0',
          className
        )}
        {...props}
      >
        {children}
        {badge && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
        )}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-accent-dark text-white font-inter text-[9px] font-semibold flex items-center justify-center border-2 border-white px-1 shadow-sm">
            {badgeCount}
          </span>
        )}
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';
