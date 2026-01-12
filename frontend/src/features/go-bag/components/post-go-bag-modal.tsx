import { useState } from 'react';
import { LuX, LuSend, LuImage } from 'react-icons/lu';

import Toast from '@/components/ui/toast/toast';
import { useCreatePost } from '@/features/community-posts/api/create-post';

interface PostBagModalProps {
  onClose: () => void;
  completeness: number;
  bagImage: string | null;
}

export default function PostBagModal({
  onClose,
  completeness,
  bagImage,
}: PostBagModalProps) {
  const [caption, setCaption] = useState('');

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const createPostMutation = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    createPostMutation.mutate(
      {
        caption,
      },
      {
        onSuccess: () => {
          setToast({
            show: true,
            message: 'Go Bag posted successfully!',
            type: 'success',
          });
          setTimeout(() => onClose(), 2000);
        },
        onError: () => {
          setToast({
            show: true,
            message: 'Failed to post. Please try again.',
            type: 'error',
          });
        },
      },
    );
  };

  return (
    <div className="modal modal-open">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="modal-box w-full max-w-md overflow-hidden rounded-2xl bg-white p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-lg font-bold text-[#2A4263]">
            Share to Community
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-4">
            {/* Image Preview Area */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  Go Bag Photo
                </span>
              </label>

              <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {bagImage ? (
                  <img
                    src={bagImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400">
                    <LuImage className="mb-2 h-8 w-8" />
                    <span className="text-xs font-semibold">
                      No image available
                    </span>
                  </div>
                )}

                {/* Hover Effect */}
              </div>
            </div>

            {/* Caption Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  Write a caption
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 w-full bg-white text-base focus:border-[#2A4263] focus:outline-none"
                placeholder="Inspire others! e.g., 'Ready for the typhoon season! 🌧️'"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Info Card */}
            <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="flex-1">
                <p className="text-xs text-[#2A4263]">
                  <span className="font-bold">Note:</span> Your current
                  checklist status (
                  <span
                    className={
                      completeness === 100
                        ? 'font-bold text-green-600'
                        : 'font-bold'
                    }
                  >
                    {completeness}%
                  </span>
                  ) will be attached to this post automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createPostMutation.isPending}
              className="btn btn-ghost text-gray-500 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPostMutation.isPending || !caption.trim()}
              className="btn gap-2 border-none bg-[#2A4263] px-6 text-white hover:bg-[#1f324b] disabled:bg-gray-400"
            >
              {createPostMutation.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <LuSend className="h-4 w-4" />
                  Post Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div
        className="modal-backdrop bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
    </div>
  );
}
