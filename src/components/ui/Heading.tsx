import React from 'react';
import { cn } from '../../lib/cn';

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingElement;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      as: Component = 'h2',
      size,
      weight = 'bold',
      align = 'left',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Map default sizes if none provided based on the semantic tag
    const defaultSizeMap: Record<HeadingElement, HeadingProps['size']> = {
      h1: '4xl',
      h2: '3xl',
      h3: '2xl',
      h4: 'xl',
      h5: 'lg',
      h6: 'md',
    };

    const activeSize = size || defaultSizeMap[Component];

    return (
      <Component
        ref={ref}
        className={cn(
          'font-poppins text-text-primary tracking-tight',
          
          // Sizing
          activeSize === '4xl' && 'text-4xl md:text-5xl leading-tight',
          activeSize === '3xl' && 'text-3xl md:text-4xl leading-tight',
          activeSize === '2xl' && 'text-2xl md:text-3xl leading-snug',
          activeSize === 'xl' && 'text-xl md:text-2xl leading-snug',
          activeSize === 'lg' && 'text-lg md:text-xl leading-snug',
          activeSize === 'md' && 'text-base md:text-lg leading-normal',
          activeSize === 'sm' && 'text-sm md:text-base leading-normal',
          activeSize === 'xs' && 'text-xs md:text-sm leading-normal',
          
          // Weights
          weight === 'normal' && 'font-normal',
          weight === 'medium' && 'font-medium',
          weight === 'semibold' && 'font-semibold',
          weight === 'bold' && 'font-bold',
          weight === 'extrabold' && 'font-extrabold',
          
          // Alignment
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          align === 'left' && 'text-left',
          
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';
