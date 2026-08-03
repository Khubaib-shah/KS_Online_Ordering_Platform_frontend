import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/cn';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
}

export function Tooltip({ content, children, position = 'right', disabled = false }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    const margin = 10;

    if (position === 'right') {
      top = rect.top + rect.height / 2 + window.scrollY;
      left = rect.right + margin + window.scrollX;
    } else if (position === 'top') {
      top = rect.top - margin + window.scrollY;
      left = rect.left + rect.width / 2 + window.scrollX;
    } else if (position === 'bottom') {
      top = rect.bottom + margin + window.scrollY;
      left = rect.left + rect.width / 2 + window.scrollX;
    } else if (position === 'left') {
      top = rect.top + rect.height / 2 + window.scrollY;
      left = rect.left - margin + window.scrollX;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (visible) {
      updatePosition();
      // Handle scrolling and resizing to update position reactively
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [visible]);

  if (disabled || !content) return children;

  const trigger = React.cloneElement(children as React.ReactElement<any>, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      const { ref } = children as any;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      setVisible(true);
      const props = children.props as any;
      if (props.onMouseEnter) props.onMouseEnter(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      setVisible(false);
      const props = children.props as any;
      if (props.onMouseLeave) props.onMouseLeave(e);
    }
  });

  const translateClass = {
    top: '-translate-x-1/2 -translate-y-full',
    right: 'translate-y-[-50%]',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full translate-y-[-50%]',
  }[position];

  return (
    <>
      {trigger}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.92,
                x: position === 'right' ? -4 : position === 'left' ? 4 : 0,
                y: position === 'bottom' ? -4 : position === 'top' ? 4 : 0,
              }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: coords.top,
                left: coords.left,
                zIndex: 9999,
              }}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold text-white bg-accent-dark rounded-xl whitespace-nowrap shadow-lg pointer-events-none font-inter tracking-wide border border-white/10 flex items-center gap-1.5',
                translateClass
              )}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
