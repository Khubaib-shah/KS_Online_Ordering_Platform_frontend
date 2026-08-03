import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationOptions } from './confirmation.types';
import { Loader2, Trash2, AlertTriangle, Info, CheckCircle, HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface ConfirmationModalProps {
  options: ConfirmationOptions | null;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmationModal({ options, onConfirm, onCancel }: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus trap and keyboard events
  useEffect(() => {
    if (!options) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return; // Ignore input while loading
      
      if (e.key === 'Escape' && options.closeOnEsc !== false) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Auto focus the primary action button to enable immediate "Enter"
    const timer = setTimeout(() => {
      const confirmBtn = document.getElementById('confirmation-modal-confirm-btn');
      if (confirmBtn) confirmBtn.focus();
    }, 100); // small delay for animation

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [options, onCancel, isLoading]);

  if (!options) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed', error);
      // In a real app we might show a toast here. Modal stays open.
    } finally {
      // The modal might be unmounted before finally runs if confirmed,
      // but we set false just in case it errored and stayed open.
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isLoading) return;
    if (e.target === e.currentTarget && options.closeOnOutsideClick !== false) {
      onCancel();
    }
  };

  // Determine variant styles
  const variant = options.variant || 'primary';
  
  const variantStyles = {
    destructive: {
      icon: Trash2,
      iconBg: 'bg-red-50 text-red-600 border-red-100',
      button: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
      focus: 'focus-visible:ring-red-500'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
      focus: 'focus-visible:ring-amber-500'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
      focus: 'focus-visible:ring-blue-500'
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-50 text-green-600 border-green-100',
      button: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
      focus: 'focus-visible:ring-green-500'
    },
    primary: {
      icon: HelpCircle,
      iconBg: 'bg-surface-hover text-text-primary border-border-subtle',
      button: 'bg-accent-primary hover:bg-accent-dark text-white shadow-sm',
      focus: 'focus-visible:ring-accent-primary'
    }
  };

  const style = variantStyles[variant];
  const IconComponent = options.icon || style.icon;
  const showIcon = options.showIcon !== false;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-desc"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />

        {/* Modal Panel */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            mass: 0.8
          }}
          className="relative bg-white rounded-2xl shadow-2xl border border-border-subtle w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="p-6 sm:p-8">
            <div className="flex gap-4 sm:gap-5">
              {showIcon && (
                <div className={cn("flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center", style.iconBg)}>
                  <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                </div>
              )}
              <div className="flex flex-col gap-2 flex-1 pt-1">
                <h3 id="confirmation-modal-title" className="text-lg font-semibold text-text-primary font-inter leading-tight">
                  {options.title}
                </h3>
                {options.description && (
                  <p id="confirmation-modal-desc" className="text-sm text-text-secondary leading-relaxed">
                    {options.description}
                  </p>
                )}
                {options.children && (
                  <div className="mt-3">
                    {options.children}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {options.footer ? (
            options.footer
          ) : (
            <div className="bg-surface-hover/50 border-t border-border-subtle px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg font-medium text-[14px] transition-colors border border-border-subtle bg-white text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {options.cancelText || 'Cancel'}
              </button>
              
              <button
                id="confirmation-modal-confirm-btn"
                type="button"
                disabled={isLoading}
                onClick={handleConfirm}
                className={cn(
                  "relative px-5 py-2.5 rounded-lg font-medium text-[14px] transition-all flex items-center justify-center min-w-[100px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed",
                  style.button,
                  style.focus
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>{options.variant === 'destructive' ? 'Deleting...' : 'Processing...'}</span>
                  </>
                ) : (
                  <span>{options.confirmText || 'Confirm'}</span>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
