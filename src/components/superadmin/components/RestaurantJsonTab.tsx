import React from 'react';import { Button } from '@/components/ui/Button';

import { Code, AlertTriangle } from 'lucide-react';

interface RestaurantJsonTabProps {
  jsonSnippet: string;
  setJsonSnippet: (val: string) => void;
  jsonError: string | null;
  setJsonError: (err: string | null) => void;
  lightColor: string;
  brandColor: string;
  syncJsonToFormState: (rawJson: string) => boolean;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  handleSaveSettings: (e: React.FormEvent) => void;
}

export const RestaurantJsonTab: React.FC<RestaurantJsonTabProps> = ({
  jsonSnippet,
  setJsonSnippet,
  jsonError,
  setJsonError,
  lightColor,
  brandColor,
  syncJsonToFormState,
  addToast,
  handleSaveSettings
}) => {
  return (
    <div className="bg-white border border-border-subtle rounded-card p-6 shadow-card space-y-4 text-left font-inter font-sans">
      <div className="p-4.5 bg-text-primary text-white rounded-2xl border border-border-subtle/20 space-y-2 select-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Code size={14} style={{ color: lightColor }} />
          <span>Dynamic JSON Configuration Schema Override Code</span>
        </div>
        <p className="text-[11px] text-white/70 leading-relaxed">
          This schema defines this restaurant instance. Paste custom JSON structures or sync fields. Click <strong>Apply & Validate Snippet</strong> to sync back to the visual layout, then click Save Settings.
        </p>
      </div>

      <div className="relative">
        <textarea
          value={jsonSnippet}
          onChange={(e) => {
            setJsonSnippet(e.target.value);
            if (jsonError) setJsonError(null);
          }}
          placeholder='{ "name": "Mamma Mia", "tagline": "Authentic wood fired pizza", "phone": "+923001234567" }'
          className="w-full h-96 p-4.5 bg-slate-950 text-emerald-400 border border-slate-850 rounded-2xl font-mono text-xs focus:ring-1 focus:ring-emerald-500/50 outline-none leading-relaxed resize-none"
        />
      </div>

      {jsonError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 flex items-start gap-2 select-none">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>Error Parsing JSON: {jsonError}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-muted p-3.5 rounded-2xl border border-border-subtle select-none">
        <span className="text-[11px] font-semibold text-text-secondary">Validation status: {jsonError ? '❌ syntax error' : '✓ valid structure'}</span>
        <div className="flex gap-2.5">
          <Button variant="custom" size="none"             type="button"
            onClick={() => {
              const success = syncJsonToFormState(jsonSnippet);
              if (success) {
                addToast('JSON synced back to visual form fields successfully!', 'success');
              } else {
                addToast('Could not sync snippet. Correct JSON structure errors first.', 'error');
              }
            }}
            className="px-4 h-9.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Apply & Validate Snippet
          </Button>
          <Button variant="custom" size="none"             type="button"
            onClick={handleSaveSettings}
            className="px-5 h-9.5 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer hover:opacity-95"
            style={{ backgroundColor: brandColor }}
          >
            Direct Save Parameters
          </Button>
        </div>
      </div>
    </div>
  );
};
