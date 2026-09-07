import { useEffect, useRef, useState } from 'react';
import { Camera, User, X, Loader2, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api-client';
import { Modal } from '../../components/ui/Modal';

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function AvatarUpload({ value, onChange, disabled }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setUploading(true);
    try {
      const res = await api.upload<{ url: string }>('/profile/upload', file, { type: 'avatar' });
      setImgError(false);
      onChange(res.url);
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const avatarBody = value && !imgError ? (
    <img
      src={value}
      alt="Profile"
      onClick={() => setPreviewOpen(true)}
      onError={() => setImgError(true)}
      className="h-full w-full cursor-pointer object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center">
      {imgError ? (
        <ImageOff className="h-12 w-12 text-brand-200/40" />
      ) : (
        <User className="h-12 w-12 text-brand-200/50" />
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-5">
      <div
        className={`relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/10 bg-white/5 ${
          dragOver ? 'border-brand-400' : ''
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
      >
        {avatarBody}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
        />
        {!disabled && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm font-medium text-brand-100 hover:bg-white/20"
            >
              <Camera className="h-4 w-4" />
              {value ? 'Change photo' : 'Upload photo'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { setImgError(false); onChange(''); }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-200 hover:text-danger-400"
              >
                <X className="h-4 w-4" /> Remove
              </button>
            )}
            <p className="w-full text-xs text-brand-200/60 sm:w-auto">JPG, PNG, WebP or GIF. Max 10MB.</p>
          </>
        )}
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        header="Profile Photo"
        body={
          <div className="flex justify-center">
            {value && !imgError ? (
              <img src={value} alt="Profile" className="max-h-[60vh] rounded-lg object-contain" />
            ) : (
              <div className="flex h-40 items-center justify-center text-brand-200/60">
                <ImageOff className="h-10 w-10" />
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}