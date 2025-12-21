import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';

import AuthBackgroundShape from '@/assets/svg/auth-background-shape';
import { resetPassword } from '@/lib/auth';

interface FormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setApiError('Invalid or missing token.');
      return;
    }

    setApiError('');
    try {
      // Only send the actual password to the API
      await resetPassword({ password: data.password, token });
      navigate('/auth/login');
    } catch (err) {
      setApiError('Failed to reset password. The link may have expired.');
    }
  };

  // Immediate check for token presence
  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4 text-center">
        <div className="alert alert-error max-w-md shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Invalid or missing reset token. Please request a new link.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme="light"
      className="bg-base-200 relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-slate-900"
    >
      {/* Background Shape */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <AuthBackgroundShape className="text-slate-500" />
      </div>

      <div className="card z-10 w-full max-w-[420px] border border-slate-100 bg-white shadow-xl">
        <div className="card-body p-8">
          {/* Logo Section */}
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
              {/* PrepPAL Logo Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">PrepPAL</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p className="mt-2 mb-6 text-sm leading-relaxed text-slate-500">
            Please enter your new password below.
          </p>

          {apiError && (
            <div className="alert alert-error mb-4 border border-red-100 bg-red-50 py-2 text-sm text-red-600">
              <span>{apiError}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* New Password Field */}
            <div className="form-control w-full">
              <label className="label justify-start pt-0 pb-1.5">
                <span className="label-text font-medium text-slate-900">
                  New Password
                </span>
                <span className="ml-0.5 text-red-500">*</span>
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                className={`input input-bordered w-full bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                  errors.password
                    ? 'input-error focus:border-red-500'
                    : 'border-slate-200 focus:border-slate-400'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />

              {errors.password && (
                <span className="mt-1.5 ml-1 text-xs text-red-500">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control w-full">
              <label className="label justify-start pt-0 pb-1.5">
                <span className="label-text font-medium text-slate-900">
                  Confirm Password
                </span>
                <span className="ml-0.5 text-red-500">*</span>
              </label>

              <input
                type="password"
                placeholder="Confirm new password"
                className={`input input-bordered w-full bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                  errors.confirmPassword
                    ? 'input-error focus:border-red-500'
                    : 'border-slate-200 focus:border-slate-400'
                }`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => {
                    if (watch('password') !== val) {
                      return 'Your passwords do not match';
                    }
                  },
                })}
              />

              {errors.confirmPassword && (
                <span className="mt-1.5 ml-1 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn mt-2 w-full border-none bg-[#1e293b] text-white normal-case hover:bg-[#0e7490] disabled:bg-[#94a3b8] disabled:text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm text-white"></span>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
