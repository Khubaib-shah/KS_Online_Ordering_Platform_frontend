import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { isOwner } from '@/lib/security';
import { InputField } from '@/components/ui/forms/InputField';
import { ImageUploadField } from '@/components/ui/forms/ImageUploadField';
import { Button } from '@/components/ui/Button';

interface AccountTabProps {
  currentUser: any;
  updateCurrentUserProfile: (profile: { name: string; avatarUrl?: string }) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function AccountTab({ currentUser, updateCurrentUserProfile, addToast }: AccountTabProps) {
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(
    currentUser?.avatarUrl || 'https://i.pinimg.com/736x/34/5c/6d/345c6d52234bbc72407ea25d49ad945e.jpg'
  );
  const [profileEmail] = useState(currentUser?.email || '');
  const [profilePassword] = useState('••••••••••••');

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: profileName.trim(),
      avatarUrl: profileAvatarUrl.trim()
    });
    addToast('Admin security profile updated successfully!', 'success');
  };

  return (
    <form onSubmit={handleSaveAccount} className="flex flex-col gap-6 animate-fade-in" id="form-account">
      <div className="border-b border-border-subtle/10 pb-3 flex flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-extrabold text-base text-text-primary">
            Profile Security
          </h3>
          <p className="text-xs text-text-secondary">Update your login and profile details.</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-extrabold uppercase whitespace-nowrap shrink-0">
          {isOwner(currentUser) ? 'Owner' : (currentUser?.role || 'Staff')}
        </div>
      </div>

      {/* Profile Avatar Selection Box */}
      <div className="flex items-center gap-5 bg-slate-50 p-4.5 rounded-2xl border border-border-subtle/15">
        {profileAvatarUrl ? (
          <img
            src={profileAvatarUrl}
            alt={profileName}
            className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-white shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-white flex items-center justify-center text-indigo-700 text-lg font-extrabold shadow-sm shrink-0 uppercase">
            {profileName ? profileName.slice(0, 2) : '?'}
          </div>
        )}
        <div className="space-y-1 w-full text-left">
          <ImageUploadField
            label="Profile Image URL"
            value={profileAvatarUrl}
            onChange={setProfileAvatarUrl}
            tenantSlug={currentUser?.tenantSlug}
            imageType="Avatar"
            placeholder="e.g. https://example.com/avatar.jpg"
          />
          <p className="text-[10px] text-text-secondary/70 mt-1.5">Provide a hosted Unsplash or graphic URL for your dashboard avatar image.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        <InputField
          label="Full Name"
          type="text"
          required
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
        />

        <InputField
          label="Email Address"
          type="email"
          required
          disabled
          value={profileEmail}
          title="Emails are system locked."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        <div className="relative">
          <InputField
            label="Password"
            type="text"
            disabled
            value={profilePassword}
          />
          <span className="absolute right-3.5 top-7.5 text-[9px] font-medium text-green-600 bg-green-50 border border-green-100/50 px-2 py-0.5 rounded-md">Protected</span>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border-subtle/10 mt-2">
        <Button
          type="submit"
          icon={<Save size={13} />}
          size="sm"
          className="rounded-full px-5 h-10 text-xs font-bold"
        >
          Save Profile
        </Button>
      </div>
    </form>
  );
}
