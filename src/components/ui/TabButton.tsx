import { cn } from '@/lib/cn';
import React from 'react';

export interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function TabButton({ isActive, icon, children, className, ...props }: TabButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer outline-none focus:outline-none',
        isActive
          ? 'border-accent-primary text-accent-primary font-bold'
          : 'border-transparent text-text-secondary hover:text-text-primary',
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
