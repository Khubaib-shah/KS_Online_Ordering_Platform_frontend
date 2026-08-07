import React, { useState } from 'react'; import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<any>;
}

export function CancelOrderModal({ isOpen, onClose, onSubmit }: CancelOrderModalProps) {
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(cancelReason.trim());
      setCancelReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[22px] shadow-shell border border-border-subtle p-6 select-none animate-scale-up text-left">
        <h3 className="font-poppins font-bold text-lg text-text-primary mb-2">Cancel Order</h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          Are you sure you want to cancel this order? This action is irreversible. Please specify the reason below.
        </p>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter cancellation reason (e.g. out of ingredients, client requested...)"
          />
          <div className="flex justify-end gap-3.5 mt-4">
            <Button variant="custom" size="none" type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-primary bg-[#FAFAFA] border border-border-subtle hover:bg-[#F5F5F5] rounded-full transition-all cursor-pointer"
            >
              Close
            </Button>
            <Button variant="custom" size="none" type="submit" loading={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all cursor-pointer"
            >
              Confirm Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
