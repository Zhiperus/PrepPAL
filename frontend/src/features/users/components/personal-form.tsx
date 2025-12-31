import { zodResolver } from '@hookform/resolvers/zod';
import {
  UpdateProfileInfoRequestSchema,
  type UpdateProfileInfoRequest,
  type User,
} from '@repo/shared/dist/schemas/user.schema';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { LuCheckCheck, LuLock } from 'react-icons/lu';

import { useUpdateProfile } from '../api/update-profile';

import Toast from '@/components/ui/toast/toast';

export default function PersonalForm({ user }: { user: User }) {
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const updateProfile = useUpdateProfile({
    mutationConfig: {
      onSuccess: () => {
        setToast({
          show: true,
          message: 'Preferences saved successfully!',
          type: 'success',
        });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      },
      onError: (error: any) => {
        setToast({
          show: true,
          message:
            error?.response?.data?.message || 'Failed to update preferences',
          type: 'error',
        });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<UpdateProfileInfoRequest>({
    resolver: zodResolver(UpdateProfileInfoRequestSchema),
    defaultValues: {
      notification: {
        email: user.notification?.email ?? true,
        sms: user.notification?.sms ?? false,
      },
    },
  });

  const onSubmit: SubmitHandler<UpdateProfileInfoRequest> = async (
    formData,
  ) => {
    await updateProfile.mutateAsync({ data: formData });
    reset(formData);
  };

  return (
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full flex-col space-y-6"
      >
        {/* Read-Only Section */}
        <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
            <LuLock className="h-4 w-4" />
            <span>Personal Info (Read-Only)</span>
          </div>
          <div className="space-y-1">
            <label className="block text-base font-bold text-[#4B5563]">
              Email
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-200/50 px-4 py-2.5 text-base font-medium text-gray-500 shadow-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-base font-bold text-[#4B5563]">
              Phone Number
            </label>
            <input
              type="text"
              value={user.phoneNumber || 'Not provided'}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-200/50 px-4 py-2.5 text-base font-medium text-gray-500 shadow-sm"
            />
          </div>
        </div>

        {/* Editable Preferences */}
        <div>
          <h3 className="mb-4 text-base font-bold text-[#4B5563]">
            Notification Preferences
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-sm font-medium text-gray-600">
              Send reminders via:
            </span>
            <label className="group flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                {...register('notification.email')}
                className="peer sr-only"
              />
              <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all group-hover:border-gray-400 peer-checked:border-[#10B981] peer-checked:bg-[#10B981] peer-checked:[&_svg]:opacity-100">
                <LuCheckCheck
                  size={16}
                  className="text-white opacity-0 transition-opacity"
                  strokeWidth={3}
                />
              </div>
              <span className="text-sm font-medium text-[#2A4263] transition-colors group-hover:text-[#15253C] peer-checked:text-[#10B981]">
                Email
              </span>
            </label>
            <label className="group flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                {...register('notification.sms')}
                className="peer sr-only"
              />
              <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all group-hover:border-gray-400 peer-checked:border-[#10B981] peer-checked:bg-[#10B981] peer-checked:[&_svg]:opacity-100">
                <LuCheckCheck
                  size={16}
                  className="text-white opacity-0 transition-opacity"
                  strokeWidth={3}
                />
              </div>
              <span className="text-sm font-medium text-[#2A4263] transition-colors group-hover:text-[#15253C] peer-checked:text-[#10B981]">
                SMS
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-4 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 rounded-lg border-2 border-[#0891B2] bg-white py-3 text-xl font-bold text-[#0891B2] transition-colors hover:bg-[#ECFEFF]"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex-1 rounded-lg bg-[#2A4263] py-3 text-xl font-bold text-white shadow-sm transition-colors hover:bg-[#3E8DAB] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </>
  );
}
