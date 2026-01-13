import { zodResolver } from '@hookform/resolvers/zod';
import {
  UpdateProfileInfoRequestSchema,
  type UpdateProfileInfoRequest,
  type User,
} from '@repo/shared/dist/schemas/user.schema';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { LuCircleAlert } from 'react-icons/lu';

import { useUpdateProfile } from '../api/update-profile';

import Toast from '@/components/ui/toast/toast';

export default function HouseholdForm({ user }: { user: User }) {
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
          message: 'Household info updated!',
          type: 'success',
        });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      },
      onError: (error: any) => {
        setToast({
          show: true,
          message: error?.response?.data?.message || 'Update failed',
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
    watch,
    trigger,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(UpdateProfileInfoRequestSchema),
    mode: 'onChange',
    defaultValues: {
      householdName: user.householdName || '',
      householdInfo: {
        memberCount: user.householdInfo?.memberCount || 1,
        femaleCount: user.householdInfo?.femaleCount || 0,
        pets: user.householdInfo?.pets || 0,
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
        className="flex h-full flex-col space-y-4"
        noValidate
      >
        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
            <LuCircleAlert className="h-5 w-5 shrink-0" />
            <span>Please fix the errors below.</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-base font-bold text-[#4B5563]">
            Household Name
          </label>
          <input
            type="text"
            {...register('householdName')}
            className={`w-full rounded-lg border px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none ${
              errors.householdName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[#9CA3AF] focus:border-transparent focus:ring-[#2A4263]'
            }`}
          />
          {errors.householdName && (
            <p className="text-sm text-red-500">
              {errors.householdName.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-base font-bold text-[#4B5563]">
            Total Members
          </label>
          <input
            type="number"
            {...register('householdInfo.memberCount', { 
              valueAsNumber: true,  
              onChange: () => {
                trigger('householdInfo.femaleCount');
              }
            })}
            className={`w-full rounded-lg border px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none ${
              errors.householdInfo?.memberCount
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[#9CA3AF] focus:border-transparent focus:ring-[#2A4263]'
            }`}
          />
          {errors.householdInfo?.memberCount && (
            <p className="text-sm text-red-500">
              {errors.householdInfo.memberCount.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-base font-bold text-[#4B5563]">
            Female Members
          </label>
          <input
            type="number"
            max={watch('householdInfo.memberCount') as number || 1}
            {...register('householdInfo.femaleCount', { valueAsNumber: true })}
            className={`w-full rounded-lg border px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none ${
              errors.householdInfo?.femaleCount
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[#9CA3AF] focus:border-transparent focus:ring-[#2A4263]'
            }`}
          />
          {errors.householdInfo?.femaleCount && (
            <p className="text-sm text-red-500">
              {errors.householdInfo.femaleCount.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-base font-bold text-[#4B5563]">
            Pets
          </label>
          <input
            type="number"
            {...register('householdInfo.pets', { valueAsNumber: true })}
            className="w-full rounded-lg border border-[#9CA3AF] px-4 py-2.5 text-base font-medium text-gray-700 focus:ring-2 focus:ring-[#2A4263] focus:outline-none"
          />
        </div>

        <div className="mt-auto flex gap-4 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 rounded-lg border-2 border-[#0891B2] bg-white py-3 text-xl font-bold text-[#0891B2] transition-colors hover:bg-[#ECFEFF]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty || !isValid}
            className="flex-1 rounded-lg bg-[#2A4263] py-3 text-xl font-bold text-white shadow-sm transition-colors hover:bg-[#3E8DAB] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Update Household'}
          </button>
        </div>
      </form>
    </>
  );
}
