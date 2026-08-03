import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SimplePageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  categoryTag?: string;
  statusBadge?: {
    text: string;
    pulseColor?: string;
  };
  actions?: ReactNode;
  className?: string;
}

export function SimplePageHeader({
  title,
  description,
  actions,
  className
}: SimplePageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 select-none animate-fade-in", className)}>
      <div>
        <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary leading-[1.2] pl-0.5">
          {title}
        </h1>
        {description && (
          <p className="font-inter text-[15px] sm:text-base text-text-secondary mt-1 leading-[1.5]">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
