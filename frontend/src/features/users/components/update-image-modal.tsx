import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { LuImagePlus, LuUpload, LuX } from 'react-icons/lu';

import { useUpdateProfileImage } from '../api/update-profile-image';

import Toast from '@/components/ui/toast/toast';

type UpdateImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentImageChar?: string;
  currentImageUrl?: string;
};

export function UpdateImageModal({
  isOpen,
  onClose,
  currentImageChar,
  currentImageUrl,
}: UpdateImageModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  const updateProfileImageMutation = useUpdateProfileImage({
    mutationConfig: {
      onSuccess: () => {
        setToast({
          show: true,
          message: 'Avatar updated successfully!',
          type: 'success',
        });
        setTimeout(() => {
          handleClose();
        }, 1500);
      },
      onError: (error: any) => {
        setToast({
          show: true,
          message: error?.response?.data?.message || 'Failed to upload avatar',
          type: 'error',
        });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      },
    },
  });

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // 1. Check if clipboard has items
      if (!e.clipboardData || !e.clipboardData.items) return;

      const items = e.clipboardData.items;

      // 2. Loop through items to find an image
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          // 3. Get the blob as a File
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault(); // Prevent pasting into other inputs if any

            // 4. Reuse your existing preview logic
            const objectUrl = URL.createObjectURL(file);
            setSelectedFile(file);
            setPreviewUrl(objectUrl);

            setToast({
              show: true,
              message: 'Image pasted from clipboard!',
              type: 'success',
            });
            setTimeout(
              () => setToast((prev) => ({ ...prev, show: false })),
              2000,
            );
          }
          break; // Stop after finding the first image
        }
      }
    };

    // Only attach listener if modal is open
    if (isOpen) {
      window.addEventListener('paste', handlePaste);
    }

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({
        show: true,
        message: 'Please select an image file',
        type: 'error',
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    const formData = new FormData();

    formData.append('image', selectedFile);

    await updateProfileImageMutation.mutateAsync({ data: formData });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || null);
    if (previewUrl && previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 duration-200"
      onClick={handleClose}
    >
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div
        className="animate-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#2A4263] p-4 text-white">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <LuImagePlus className="h-5 w-5" /> Update Profile Photo
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 transition-colors hover:bg-white/10"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-6 p-6">
          <div className="avatar placeholder group relative">
            <div className="bg-neutral text-neutral-content h-32 w-32 overflow-hidden rounded-full shadow-sm ring-4 ring-white">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold">
                  {currentImageChar || 'U'}
                </span>
              )}
            </div>
            <button
              onClick={triggerFileInput}
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <LuUpload className="h-8 w-8 text-white" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-center transition-colors hover:bg-gray-100"
          >
            <LuUpload className="h-8 w-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {selectedFile ? selectedFile.name : 'Click to upload a new image'}
            </span>
            <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
          </label>
        </div>

        <div className="flex gap-4 border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg border-2 border-[#0891B2] bg-white py-2.5 text-lg font-bold text-[#0891B2] transition-colors hover:bg-[#ECFEFF]"
            disabled={updateProfileImageMutation.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFile || updateProfileImageMutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2A4263] py-2.5 text-lg font-bold text-white shadow-sm transition-colors hover:bg-[#3E8DAB] disabled:opacity-50"
          >
            {updateProfileImageMutation.isPending && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
