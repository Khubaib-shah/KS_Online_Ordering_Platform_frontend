import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/cn';

export interface BaseCardProps extends Omit<HTMLMotionProps<"div">, 'title'> {
  id?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode; // Alternative name for subtitle
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  hoverEffect?: boolean;
  divider?: boolean;
  noPadding?: boolean;
}

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  (
    {
      id,
      title,
      subtitle,
      description,
      action,
      children,
      className,
      headerClassName,
      contentClassName,
      hoverEffect = false,
      divider = false,
      noPadding = false,
      ...props
    },
    ref
  ) => {
    const cardSubtitle = subtitle || description;
    const hasHeader = title || cardSubtitle || action;

    return (
      <motion.div
        ref={ref}
        id={id}
        className={cn(
          'bg-white border border-border-subtle/50 rounded-card shadow-card overflow-hidden flex flex-col @container',
          hoverEffect && 'transition-all duration-300 hover:shadow-shell hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {/* Card Header */}
        {hasHeader && (
          <div
            className={cn(
              'flex items-center justify-between shrink-0 px-4 sm:px-5 lg:px-6 py-3.5 sm:py-4 lg:py-5',
              divider && 'border-b border-border-subtle/40 pb-3.5',
              headerClassName
            )}
          >
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="font-poppins font-bold text-[16px] sm:text-[18px] md:text-[20px] text-text-primary leading-[1.2] line-clamp-2 whitespace-normal break-words">
                  {title}
                </h3>
              )}
              {cardSubtitle && (
                <p className="font-inter text-[11px] sm:text-[13px] text-text-secondary mt-1 leading-[1.4] line-clamp-2 whitespace-normal break-words">
                  {cardSubtitle}
                </p>
              )}
            </div>

            {action && <div className="ml-4 shrink-0">{action}</div>}
          </div>
        )}

        {/* Card Body */}
        <div
          className={cn(
            'flex-1 min-h-0',
            !noPadding && (hasHeader ? 'px-4 pb-4 pt-0 sm:px-5 sm:pb-5 sm:pt-0 lg:px-6 lg:pb-6 lg:pt-0' : 'p-4 sm:p-5 lg:p-6'),
            contentClassName
          )}
        >
          {children}
        </div>
      </motion.div>
    );
  }
);

BaseCard.displayName = 'BaseCard';
