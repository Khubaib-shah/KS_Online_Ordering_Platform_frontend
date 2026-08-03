import React from 'react';
import { cn } from '../../lib/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  id?: string;
  key?: string | number;
}

export function Skeleton({ className, id, ...props }: SkeletonProps) {
  return (
    <div
      id={id}
      className={cn(
        'animate-pulse bg-surface-hover rounded-card border border-border-subtle',
        className
      )}
      {...props}
    />
  );
}
