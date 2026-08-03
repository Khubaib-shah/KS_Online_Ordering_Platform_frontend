import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/cn';

interface BadgeProps extends HTMLMotionProps<"span"> {
  variant?: 'completed' | 'progress' | 'pending' | 'notification' | 'neutral' | 'danger';
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className, id, ...props }: BadgeProps) {
  return (
    <motion.span
      id={id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'inline-flex items-center justify-center rounded-tag font-inter font-semibold text-xs transition-colors',

        variant === 'completed' &&
        'bg-status-completed-bg text-status-completed-text px-3 py-1',

        variant === 'progress' &&
        'bg-status-progress-bg text-status-progress-text px-3 py-1',

        variant === 'pending' &&
        'bg-status-pending-bg text-status-pending-text px-3 py-1',

        variant === 'danger' &&
        'bg-status-danger-bg text-status-danger-text px-3 py-1',

        variant === 'notification' &&
        'bg-accent-dark text-white px-2 py-0.5 text-[10px] min-w-[20px] h-[20px] rounded-full',

        variant === 'neutral' &&
        'bg-surface-muted border border-border-subtle text-text-secondary px-3 py-1',

        className
      )}
      {...props}
    >
      {children}
    </motion.span>
  );
}
