import React, { useState } from 'react';
import { cn } from '../../lib/cn';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  id?: string;
}

export function Avatar({ src, alt, size = 'md', className, id }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      id={id}
      className={cn(
        'relative flex items-center justify-center shrink-0 rounded-full bg-accent-tint-bg text-accent-primary font-semibold font-poppins overflow-hidden border border-border-subtle',
        sizeClasses[size],
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
}
