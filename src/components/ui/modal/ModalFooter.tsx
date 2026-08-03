import React from 'react';
import { cn } from '../../../lib/cn';
import { Button } from '../Button';
import { Check } from 'lucide-react';

export interface ModalFooterProps {
  onCancel: () => void;
  isSaving?: boolean;
  saveText?: string;
  cancelText?: string;
  submitIcon?: React.ReactNode;
  formId?: string; // If using an external form
  className?: string;
}

export function ModalFooter({ 
  onCancel, 
  isSaving, 
  saveText = 'Save', 
  cancelText = 'Cancel', 
  submitIcon = <Check size={14} />, 
  formId, 
  className 
}: ModalFooterProps) {
  return (
    <div className={cn("flex justify-end gap-3 p-2 sm:p-4 md:p-5 border-t border-border-subtle shrink-0 bg-white z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]", className)}>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        className="h-10 px-5 text-xs font-medium rounded-xl border-border-subtle text-text-secondary hover:text-text-primary"
      >
        {cancelText}
      </Button>
      <Button
        type="submit"
        form={formId}
        variant="primary"
        disabled={isSaving}
        className="h-10 px-5 text-xs font-bold rounded-xl flex items-center gap-2"
        loading={isSaving}
        icon={!isSaving && submitIcon}
      >
        {isSaving ? 'Saving...' : saveText}
      </Button>
    </div>
  );
}
