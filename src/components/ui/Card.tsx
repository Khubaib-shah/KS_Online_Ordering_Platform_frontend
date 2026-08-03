import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';

interface CardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  className?: string;
  children: React.ReactNode;
  id?: string;
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, id, hoverEffect = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        id={id}
        className={cn(
          'bg-white rounded-card shadow-card p-6 border border-border-subtle overflow-hidden',
          hoverEffect && 'transition-shadow duration-200 hover:shadow-shell cursor-pointer',
          className
        )}
        whileHover={hoverEffect ? { y: -2 } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
