import React, { useState } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { FormField, FormFieldProps } from './FormField';

interface ImageUploadFieldProps extends Omit<FormFieldProps, 'children'> {
  value: string | any;
  onChange: (url: string) => void;
  tenantSlug?: string;
  imageType?: string;
  placeholder?: string;
}

export function ImageUploadField({
  value,
  onChange,
  tenantSlug = 'default-tenant',
  imageType = 'Image',
  placeholder = 'e.g. https://example.com/image.jpg',
  label,
  required,
  hint,
  error,
  className
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useUIStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      addToast('Uploading image...', 'info');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenantSlug', tenantSlug);
      formData.append('imageType', imageType);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      const uploadedUrl = typeof result.data === 'object' ? result.data.secureUrl : result.data;
      onChange(uploadedUrl);
      addToast('Image uploaded successfully!', 'success');
    } catch (err: any) {
      addToast(`Image upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const displayValue = typeof value === 'object' ? value?.secureUrl || '' : value || '';

  return (
    <FormField label={label} required={required} hint={hint} error={error} className={className}>
      <div className="flex items-center shadow-xs">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs font-normal text-text-primary bg-white border border-border-subtle rounded-l-xl px-4 h-11 focus:outline-none focus:border-accent-primary placeholder:text-text-secondary/60"
        />
        <label className="flex items-center justify-center h-11 px-5 text-xs font-bold text-accent-primary bg-accent-tint-bg border border-l-0 border-border-subtle rounded-r-xl cursor-pointer hover:bg-accent-dark hover:text-accent-tint-bg transition-colors whitespace-nowrap">
          {isUploading ? 'Uploading...' : displayValue ? 'Replace Image' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
    </FormField>
  );
}
