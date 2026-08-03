import { Select } from '../ui/Select';
import React from 'react';
import { Input } from '../ui/Input';

interface SidebarSectionLabelProps {
  label: string;
}

export function SidebarSectionLabel({ label }: SidebarSectionLabelProps) {
  return (
    <div className="text-[11px] uppercase tracking-wider font-semibold font-inter text-text-secondary mb-3 mt-6 first:mt-0 select-none px-4">
      {label}
    </div>
  );
}
