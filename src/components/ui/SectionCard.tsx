import React from 'react';
import { BaseCard } from './BaseCard';

interface SectionCardProps {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  hoverEffect?: boolean;
}

export function SectionCard({
  id,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  hoverEffect = false,
}: SectionCardProps) {
  return (
    <BaseCard
      id={id}
      title={title}
      description={description}
      action={action}
      hoverEffect={hoverEffect}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </BaseCard>
  );
}
