import React from 'react';
import './checkbox.css';

export default function Checkbox({ checked, onChange, label = 'Checkbox' }: { checked?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; label?: React.ReactNode }) {
  // Generate a unique ID so multiple checkboxes don't conflict with their labels
  const id = React.useId();
  
  return (
    <div className="checkbox-wrapper">
      <input
        id={`custom-checkbox-${id}`}
        type="checkbox"
        className="inp-cbx"
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={`custom-checkbox-${id}`} className="cbx">
        <span>
          <svg viewBox="0 0 12 10" width="12" height="10">
            <polyline points="1.5 6 4.5 9 10.5 1" />
          </svg>
        </span>
        {label && <span>{label}</span>}
      </label>
    </div>
  );
}
