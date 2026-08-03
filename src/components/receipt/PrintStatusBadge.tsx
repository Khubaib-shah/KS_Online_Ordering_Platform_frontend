import { Select } from '../ui/Select';
import React from 'react';
import { Input } from '../ui/Input';
import { CheckCircle2, Clock, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { PrintJobStatus } from '../../types/print';

interface PrintStatusBadgeProps {
  status: PrintJobStatus;
  size?: 'sm' | 'md';
}

export function PrintStatusBadge({ status, size = 'md' }: PrintStatusBadgeProps) {
  const isSm = size === 'sm';
  const textClass = isSm ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2.5 py-1 font-bold';

  switch (status) {
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${textClass}`}>
          <Clock size={isSm ? 10 : 12} className="animate-pulse" />
          <span>Queued</span>
        </span>
      );
    case 'printing':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${textClass}`}>
          <Loader2 size={isSm ? 10 : 12} className="animate-spin text-blue-600" />
          <span>Printing</span>
        </span>
      );
    case 'printed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${textClass}`}>
          <CheckCircle2 size={isSm ? 10 : 12} />
          <span>Printed</span>
        </span>
      );
    case 'failed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${textClass}`}>
          <AlertCircle size={isSm ? 10 : 12} />
          <span>Failed</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full bg-slate-50 text-slate-500 border border-slate-200 ${textClass}`}>
          <XCircle size={isSm ? 10 : 12} />
          <span>Cancelled</span>
        </span>
      );
    default:
      return null;
  }
}
