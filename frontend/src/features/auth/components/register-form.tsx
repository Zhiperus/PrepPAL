import { zodResolver } from '@hookform/resolvers/zod';
import {
  RegisterRequestSchema,
  type RegisterRequest,
} from '@shared/schemas/auth.schema';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { LuCircleAlert, LuEye, LuEyeClosed } from 'react-icons/lu';

import facebookLogo from '@/assets/facebook-logo.svg';
import googleLogo from '@/assets/google-logo.svg';
import { useRegister } from '@/lib/auth';

type RegisterFormProps = {
  onSuccess: () => void;
};

type RegisterFormInputs = RegisterRequest & { confirmPassword?: string };

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const registerMutation = useRegister({ onSuccess });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(RegisterRequestSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setApiError(null);
    try {
      const { confirmPassword, ...payload } = data;
      // ✅ Use mutateAsync
      await registerMutation.mutateAsync(payload as RegisterRequest);
    } catch (error: any) {
      console.error(error);
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to register. Please try again.',
      );
    }
  };

  return (
    <div className="w-full">
      {/* ✅ API Error Alert */}
      {apiError && (
        <div className="border-text-error/20 bg-bg-error-container/50 text-text-error animate-in fade-in slide-in-from-top-1 mb-4 flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
          <LuCircleAlert className="h-5 w-5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-text-primary block text-sm font-bold">
            Email
          </label>
          <input
            type="email"
            placeholder="preppal@example.com"
            {...register('email')}
            className={`input mt-1 block w-full rounded-md border p-2 sm:text-sm ${
              errors.email
                ? 'input-error bg-bg-error-container/10'
                : 'border-text-primary focus:border-text-link-hover'
            }`}
          />
          {errors.email && (
            <div className="text-text-error mt-1.5 flex items-center gap-2">
              <p className="text-xs font-medium">{errors.email.message}</p>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-text-primary block text-sm font-bold">
            Password
          </label>

          <div className="relative flex">
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              {...register('password')}
              className={`input mt-1 block w-full rounded-md border p-2 sm:text-sm ${
                errors.password
                  ? 'input-error bg-bg-error-container/10'
                  : 'border-text-primary focus:border-text-link-hover'
              }`}
            />
            <div
              className="text-text-secondary hover:text-text-primary absolute top-[10px] right-2 cursor-pointer"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              {isPasswordVisible ? (
                <LuEyeClosed size={25} />
              ) : (
                <LuEye size={25} />
              )}
            </div>
          </div>
          {errors.password && (
            <div className="text-text-error mt-1.5 flex items-center gap-2">
              <p className="text-xs font-medium">{errors.password.message}</p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-text-primary block text-sm font-bold">
            Confirm Password
          </label>
          <input
            type="password"
            {...register('confirmPassword', {
              validate: (val) => {
                if (!val) {
                  return 'Confirm Password is required';
                }
                if (watch('password') !== val) {
                  return 'Your passwords do not match';
                }
              },
            })}
            className={`input mt-1 block w-full rounded-md border p-2 sm:text-sm ${
              errors.confirmPassword
                ? 'input-error bg-bg-error-container/10'
                : 'border-text-primary focus:border-text-link-hover'
            }`}
          />
          {errors.confirmPassword && (
            <div className="text-text-error mt-1.5 flex items-center gap-2">
              <p className="text-xs font-medium">
                {errors.confirmPassword.message}
              </p>
            </div>
          )}
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disabled disabled:text-text-secondary/50 flex w-full cursor-pointer justify-center rounded-md px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2"></span>
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      {/* Separator */}
      <div className="text-text-secondary border-border-container my-6 flex items-center text-xl font-medium before:me-4 before:flex-1 before:border-t after:ms-4 after:flex-1 after:border-t">
        or
      </div>

      <button
        type="button"
        disabled={isSubmitting}
        className="border-border-container mt-4 flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border bg-[#1877F2] px-4 py-2 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <img src={facebookLogo} alt="" className="h-[20px] w-[20px]" />
        Continue with Facebook
      </button>

      <button
        type="button"
        disabled={isSubmitting}
        className="text-text-secondary border-border-secondary bg-btn-secondary hover:bg-btn-secondary-hover mt-4 flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border px-4 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
      >
        <img src={googleLogo} alt="" className="h-[18px] w-[18px]" />
        Continue with Google
      </button>
    </div>
  );
}
