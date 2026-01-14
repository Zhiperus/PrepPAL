import { useState } from 'react';
import { LuTriangleAlert, LuX } from 'react-icons/lu';

import Toast from '@/components/ui/toast/toast';
import { useCreateReport } from '@/features/moderation/api/create-report';

type ReportModalProps = {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
};

const REPORT_REASONS = [
  'Inappropriate content / Nudity',
  'Spam or Misleading',
  'Harassment or Hate speech',
  'False Information',
  'Something else',
];

export default function ReportModal({
  postId,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const { mutate, isPending } = useCreateReport({
    mutationConfig: {
      onSuccess: () => {
        setToast({
          show: true,
          message: 'Report submitted successfully. Admins will review this.',
          type: 'success',
        });
        setSelectedReason('');
        setTimeout(() => {
          onClose();
          setToast((prev) => ({ ...prev, show: false }));
        }, 2000);
      },
      onError: (error: any) => {
        // Extract the specific message from your backend error handler
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to submit report. Please try again.';

        setToast({
          show: true,
          message: errorMessage,
          type: 'error',
        });

        // Keep error visible slightly longer for the user to read
        setTimeout(() => {
          setToast((prev) => ({ ...prev, show: false }));
        }, 4000);
      },
    },
  });
  const handleSubmit = () => {
    if (!selectedReason) return;
    mutate({ postId, reason: selectedReason });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="modal-box w-full max-w-md overflow-hidden rounded-2xl bg-white p-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="flex items-center gap-2 text-red-600">
            <LuTriangleAlert className="h-5 w-5" />
            <h3 className="font-bold">Report Post</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400"
            disabled={isPending}
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="mb-4 text-sm text-gray-600">
            Please select a reason for reporting this post. This helps admins
            review content effectively.
          </p>

          <div className="space-y-3">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                  selectedReason === reason
                    ? 'border-[#2a4263] bg-blue-50 text-[#2a4263]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium">{reason}</span>
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="radio radio-primary radio-sm accent-[#2a4263]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="btn btn-ghost text-gray-500 hover:bg-gray-200"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isPending}
            className="btn border-none bg-red-600 px-6 text-white hover:bg-red-700 disabled:bg-gray-400"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </div>

      <div
        className="modal-backdrop bg-black/50 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      ></div>
    </div>
  );
}
