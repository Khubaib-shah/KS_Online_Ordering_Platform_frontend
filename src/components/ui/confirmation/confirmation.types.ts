import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export type ConfirmationVariant = 'destructive' | 'warning' | 'info' | 'success' | 'primary';

export interface ConfirmationOptions {
  title: string;
  description?: string;
  variant?: ConfirmationVariant;
  
  // Custom text for buttons
  confirmText?: string;
  cancelText?: string;
  
  // Icons
  icon?: LucideIcon;
  showIcon?: boolean; // Defaults to true
  
  // Optional async action to run while showing loading state
  action?: () => Promise<void>;
  
  // Behaviors
  closeOnOutsideClick?: boolean; // Defaults to true
  closeOnEsc?: boolean; // Defaults to true
  
  // Optional content
  children?: ReactNode;
  footer?: ReactNode;
}

export interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}
